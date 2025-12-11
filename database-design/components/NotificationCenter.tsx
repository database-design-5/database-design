'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'

type Notification = {
    notification_id: number
    message: string
    is_read: boolean
    created_at: string
    order_id: number | null
}

export default function NotificationCenter() {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const supabase = createClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('notification-center')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                    showToast(t.notifications.newNotification, 'info')
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, t.notifications.newNotification, showToast])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const markAsRead = async (notificationId: number) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('notification_id', notificationId)

        if (!error) {
            setNotifications(prev => prev.map(n =>
                n.notification_id === notificationId ? { ...n, is_read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('customer_id', user.id)
            .eq('is_read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
            >
                <Bell size={24} className="text-gray-800" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-900">{t.notifications.title}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 font-medium hover:text-blue-800"
                            >
                                {t.notifications.markAllRead}
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-600 text-sm">
                                {t.notifications.noNotifications}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notification => (
                                    <div
                                        key={notification.notification_id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-800'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
