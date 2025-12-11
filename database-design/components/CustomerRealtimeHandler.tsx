'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import { useLanguage } from '@/context/LanguageContext'

export default function CustomerRealtimeHandler() {
    const supabase = createClient()
    const { showToast } = useToast()
    const { t } = useLanguage()

    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const channel = supabase
                .channel('customer-orders')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `customer_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newStatus = payload.new.order_status
                        const oldStatus = payload.old.order_status

                        if (newStatus !== oldStatus) {
                            const statusText = t.status[newStatus as keyof typeof t.status] || newStatus
                            showToast(`Order #${payload.new.order_id}: ${statusText}`, 'success')
                        }
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setupSubscription()
    }, [supabase, showToast, t])

    return null
}
