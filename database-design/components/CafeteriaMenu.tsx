'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, X, Trash2, ChevronDown, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import LanguageSelector from './LanguageSelector'
import NotificationCenter from './NotificationCenter'

type Menu = {
    menu_id: number
    cafeteria_id: number
    menu_name: string
    price: number
    image_url: string | null
    description: string | null
    stock_status: string
}

type Cafeteria = {
    cafeteria_id: number
    name: string
    location: string
    operating_hours: string
    status: string
}

type Props = {
    cafeterias: Cafeteria[]
    menus: Menu[]
}

export default function CafeteriaMenu({ cafeterias, menus }: Props) {
    const [selectedCafeteriaId, setSelectedCafeteriaId] = useState<number>(
        cafeterias[0]?.cafeteria_id || 0
    )
    const { addToCart, removeFromCart, updateQuantity, items, totalItems, totalPrice, clearCart } = useCart()
    const { t } = useLanguage()
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        checkUser()
    }, [supabase])

    const selectedCafeteria = cafeterias.find(c => c.cafeteria_id === selectedCafeteriaId)
    const currentMenus = menus.filter(m => m.cafeteria_id === selectedCafeteriaId)

    // Group items by cafeteria for the cart view
    const groupedCartItems = items.reduce((acc, item) => {
        if (!acc[item.cafeteriaId]) {
            acc[item.cafeteriaId] = {
                name: item.cafeteriaName,
                items: []
            }
        }
        acc[item.cafeteriaId].items.push(item)
        return acc
    }, {} as Record<number, { name: string, items: typeof items }>)

    const handleOrder = async () => {
        if (!user) {
            alert(t.loginRequired)
            router.push('/login')
            return
        }

        setLoading(true)

        try {
            // 1. Ensure customer record exists
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('customer_id')
                .eq('customer_id', user.id)
                .single()

            if (!customer && !customerError) {
                // Customer exists
            } else if (!customer) {
                // Create customer
                const { error: createError } = await supabase
                    .from('customers')
                    .insert({
                        customer_id: user.id,
                        email: user.email!,
                        name: user.user_metadata.name || user.email?.split('@')[0] || t.customer,
                    })

                if (createError) throw createError
            }

            // 2. Create orders for each cafeteria
            for (const [cafeteriaIdStr, data] of Object.entries(groupedCartItems)) {
                const cafeteriaId = Number(cafeteriaIdStr)
                const cafeteriaTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

                // Insert Order
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        customer_id: user.id,
                        cafeteria_id: cafeteriaId,
                        total_amount: cafeteriaTotal,
                        payment_method: 'CARD', // Default for now
                        order_status: 'PENDING'
                    })
                    .select()
                    .single()

                if (orderError) throw orderError

                // Insert Order Details
                const orderDetails = data.items.map(item => ({
                    order_id: order.order_id,
                    menu_id: item.menuId,
                    quantity: item.quantity,
                    unit_price: item.price,
                    subtotal: item.price * item.quantity
                }))

                const { error: detailsError } = await supabase
                    .from('order_details')
                    .insert(orderDetails)

                if (detailsError) throw detailsError
            }

            alert(t.orderComplete)
            clearCart()
            setIsCartOpen(false)
            // Optional: Redirect to order history
        } catch (error: any) {
            console.error('Order failed:', error)
            alert(`${t.orderFailed}: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh)] bg-gray-50 text-gray-900 relative">
            {/* Header with Language Selector */}
            <div className="glass sticky top-0 z-20 px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold tracking-tight">Cafeteria</h1>
                <div className="flex items-center gap-2">
                    <Link href="/mypage" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <User size={20} />
                    </Link>
                    <NotificationCenter />
                    <LanguageSelector />
                </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200 sticky top-[52px] z-10">
                <div className="flex overflow-x-auto no-scrollbar py-3 px-2 gap-2">
                    {cafeterias.map((cafeteria) => (
                        <button
                            key={cafeteria.cafeteria_id}
                            onClick={() => setSelectedCafeteriaId(cafeteria.cafeteria_id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCafeteriaId === cafeteria.cafeteria_id
                                ? 'bg-black text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cafeteria.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List Body */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {selectedCafeteria && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedCafeteria.name}</h2>
                        <p className="text-sm text-gray-700 mt-1">{selectedCafeteria.operating_hours}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {currentMenus.map((menu) => (
                        <div
                            key={menu.menu_id}
                            className="glass rounded-2xl p-4 flex gap-4 transition-transform active:scale-[0.98]"
                        >
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
                                {/* Image placeholder */}
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-medium">
                                    {t.noImage}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{menu.menu_name}</h3>
                                    <p className="text-sm text-gray-700 line-clamp-1 mt-1">{menu.description}</p>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="font-bold text-lg text-gray-900">
                                        {menu.price.toLocaleString()}
                                    </span>

                                    {menu.stock_status === 'IN_STOCK' ? (
                                        <button
                                            onClick={() => addToCart({
                                                menuId: menu.menu_id,
                                                menuName: menu.menu_name,
                                                price: menu.price,
                                                cafeteriaId: selectedCafeteriaId,
                                                cafeteriaName: selectedCafeteria?.name || ''
                                            })}
                                            className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-md"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                                            {t.soldOut}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {currentMenus.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-600">{t.noMenu}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Bottom Sheet Overlay */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Cart Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 glass-dark z-40 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform ${isCartOpen ? 'translate-y-0' : 'translate-y-full'
                    } max-h-[85vh] flex flex-col`}
            >
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{t.cart}</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <ChevronDown size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            {t.emptyCart}
                        </div>
                    ) : (
                        Object.entries(groupedCartItems).map(([cafeteriaId, data]) => (
                            <div key={cafeteriaId} className="space-y-3">
                                <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">
                                    {data.name}
                                </h3>
                                <div className="divide-y divide-white/10">
                                    {data.items.map((item) => (
                                        <div key={item.menuId} className="py-4 flex gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white text-lg">{item.menuName}</h4>
                                                <p className="text-sm text-gray-400">{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5 border border-white/10">
                                                    <button
                                                        onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.menuId)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-white/10 safe-area-pb bg-black/40 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">{t.total}</span>
                        <span className="text-2xl font-bold text-white">{totalPrice.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleOrder}
                        disabled={loading || items.length === 0}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
                    >
                        {loading ? t.orderProcessing : t.order}
                    </button>
                </div>
            </div>

            {/* Floating Cart Button (Only visible when cart is closed and has items) */}
            {totalItems > 0 && !isCartOpen && (
                <div className="fixed bottom-8 left-4 right-4 z-20">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-black text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between hover:scale-[1.02] transition-transform active:scale-[0.98] border border-gray-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 px-3 py-1 rounded-lg font-bold backdrop-blur-sm">
                                {totalItems}
                            </div>
                            <span className="font-medium">{t.viewCart}</span>
                        </div>
                        <div className="font-bold text-lg">
                            {totalPrice.toLocaleString()}
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}
