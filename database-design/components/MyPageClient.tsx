'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import {
    LogOut,
    CreditCard,
    Clock,
    History,
    ChevronRight,
    Plus,
    Trash2,
    ShoppingBag
} from 'lucide-react'

type Order = {
    order_id: number
    cafeteria_id: number
    order_status: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED'
    total_amount: number
    created_at: string
    cafeterias: {
        name: string
    }
    order_details: {
        menus: {
            menu_name: string
        }
        quantity: number
    }[]
}

type PaymentMethod = {
    payment_method_id: number
    type: string
    provider: string
    last_four_digits: string
    is_default: boolean
}

export default function MyPageClient() {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const router = useRouter()
    const supabase = createClient()

    const [activeTab, setActiveTab] = useState<'current' | 'history' | 'payment'>('current')
    const [orders, setOrders] = useState<Order[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    // Payment Form State
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [cardHolder, setCardHolder] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // Fetch Orders
            const { data: ordersData, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    cafeterias (name),
                    order_details (
                        quantity,
                        menus (menu_name)
                    )
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching orders:', error)
            }

            if (ordersData) setOrders(ordersData as any)

            // Fetch Payment Methods
            const { data: paymentData } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('customer_id', user.id)

            if (paymentData) setPaymentMethods(paymentData as any)

            setLoading(false)
        }

        fetchData()

        // Realtime subscription for order updates
        const channel = supabase
            .channel('mypage-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: user ? `customer_id=eq.${user.id}` : undefined
                },
                (payload) => {
                    setOrders(prev => prev.map(o =>
                        o.order_id === payload.new.order_id
                            ? { ...o, order_status: payload.new.order_status }
                            : o
                    ))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    const handleLogout = async () => {
        if (confirm(t.mypage.logoutConfirm)) {
            await supabase.auth.signOut()
            showToast(t.auth.logout, 'success')
            router.push('/login')
        }
    }

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        const { data, error } = await supabase
            .from('payment_methods')
            .insert({
                customer_id: user.id,
                type: 'CARD',
                provider: 'VISA', // Mock provider
                last_four_digits: cardNumber.slice(-4),
                is_default: paymentMethods.length === 0
            })
            .select()
            .single()

        if (error) {
            showToast('Failed to add card', 'error')
        } else {
            setPaymentMethods([...paymentMethods, data as any])
            setIsAddingCard(false)
            setCardNumber('')
            setExpiry('')
            setCvc('')
            setCardHolder('')
            showToast('Card added successfully', 'success')
        }
    }

    const handleDeletePaymentMethod = async (id: number) => {
        if (!confirm(t.common.confirmDelete)) return

        const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('payment_method_id', id)

        if (!error) {
            setPaymentMethods(paymentMethods.filter(p => p.payment_method_id !== id))
            showToast('Card deleted', 'success')
        }
    }

    const currentOrders = orders.filter(o => ['PENDING', 'COOKING', 'READY'].includes(o.order_status))
    const pastOrders = orders.filter(o => ['COMPLETED', 'CANCELED'].includes(o.order_status))

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-6 py-4 shadow-sm flex justify-between items-center">
                <h1 className="text-xl font-bold text-black">{t.mypage.title}</h1>
                <button onClick={handleLogout} className="text-black hover:text-red-500">
                    <LogOut size={20} />
                </button>
            </div>

            {/* User Info */}
            <div className="p-6 bg-white mb-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-black">{user?.user_metadata?.name?.[0] || 'U'}</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-black">{user?.user_metadata?.name || 'User'}</h2>
                        <p className="text-sm text-black">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'current' ? 'border-black text-black' : 'border-transparent text-gray-700'}`}
                >
                    {t.mypage.currentOrders}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-black text-black' : 'border-transparent text-gray-700'}`}
                >
                    {t.mypage.orderHistory}
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payment' ? 'border-black text-black' : 'border-transparent text-gray-700'}`}
                >
                    {t.mypage.paymentMethods}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {activeTab === 'current' && (
                    <div className="space-y-4">
                        {currentOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-600">{t.mypage.noOrders}</div>
                        ) : (
                            currentOrders.map(order => (
                                <div key={order.order_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-black">{order.cafeterias?.name}</h3>
                                            <p className="text-xs text-black">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            order.order_status === 'COOKING' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {t.status[order.order_status]}
                                        </span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        {order.order_details.map((detail, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-black">
                                                <span>{detail.menus?.menu_name} x{detail.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-sm font-medium text-black">{t.total}</span>
                                        <span className="font-bold text-lg text-black">{order.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {pastOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-600">{t.mypage.noOrders}</div>
                        ) : (
                            pastOrders.map(order => (
                                <div key={order.order_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 opacity-75">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-black">{order.cafeterias?.name}</h3>
                                            <p className="text-xs text-black">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.order_status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {t.status[order.order_status]}
                                        </span>
                                    </div>
                                    <div className="space-y-1 mb-3">
                                        {order.order_details.map((detail, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-black">
                                                <span>{detail.menus?.menu_name} x{detail.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-sm font-medium text-black">{t.total}</span>
                                        <span className="font-bold text-lg text-black">{order.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-4">
                        {paymentMethods.map(method => (
                            <div key={method.payment_method_id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-black">{method.provider} •••• {method.last_four_digits}</p>
                                        <p className="text-xs text-black">{method.type}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeletePaymentMethod(method.payment_method_id)} className="text-black hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}

                        {!isAddingCard ? (
                            <button
                                onClick={() => setIsAddingCard(true)}
                                className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 text-black font-medium hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                {t.mypage.addPaymentMethod}
                            </button>
                        ) : (
                            <form onSubmit={handleAddPaymentMethod} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 space-y-4">
                                <h3 className="font-bold text-lg mb-2 text-black">{t.mypage.addPaymentMethod}</h3>
                                <div>
                                    <label className="block text-xs font-medium text-black mb-1">{t.mypage.cardNumber}</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={19}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black outline-none focus:ring-2 focus:ring-black"
                                        value={cardNumber}
                                        onChange={e => setCardNumber(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-black mb-1">{t.mypage.expiry}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="MM/YY"
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black outline-none focus:ring-2 focus:ring-black"
                                            value={expiry}
                                            onChange={e => setExpiry(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-black mb-1">{t.mypage.cvc}</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={3}
                                            placeholder="123"
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black outline-none focus:ring-2 focus:ring-black"
                                            value={cvc}
                                            onChange={e => setCvc(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-black mb-1">{t.mypage.cardHolder}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Name on Card"
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-black outline-none focus:ring-2 focus:ring-black"
                                        value={cardHolder}
                                        onChange={e => setCardHolder(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCard(false)}
                                        className="flex-1 py-3 rounded-xl bg-gray-100 text-black font-bold"
                                    >
                                        {t.common.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-black text-white font-bold shadow-lg"
                                    >
                                        {t.mypage.saveCard}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
