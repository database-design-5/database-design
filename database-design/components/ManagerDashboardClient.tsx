'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { createClient } from '@/utils/supabase/client'
import {
    ClipboardList,
    Utensils,
    Store,
    CheckCircle,
    Clock,
    XCircle,
    ChefHat,
    Bell,
    DollarSign,
    TrendingUp,
    Edit2,
    Save,
    X,
    Plus,
    Trash2,
    BarChart3,
    Calendar
} from 'lucide-react'

type Order = {
    order_id: number
    customer_id: string
    cafeteria_id: number
    order_status: 'PENDING' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELED'
    total_amount: number
    payment_method: string
    created_at: string
    customers: {
        name: string | null
        email: string
    } | null
}

type Menu = {
    menu_id: number
    menu_name: string
    price: number
    description: string | null
    image_url: string | null
    stock_status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LIMITED'
    daily_limit: number
}

type Cafeteria = {
    cafeteria_id: number
    name: string
    status: string
    location: string
    operating_hours: string
}

type Props = {
    initialOrders: Order[]
    initialMenus: Menu[]
    cafeteria: Cafeteria
}

export default function ManagerDashboardClient({ initialOrders, initialMenus, cafeteria }: Props) {
    const { t } = useLanguage()
    const { showToast } = useToast()
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<'orders' | 'menus' | 'info' | 'sales'>('orders')
    const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week')
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [menus, setMenus] = useState<Menu[]>(initialMenus)
    const [cafeteriaInfo, setCafeteriaInfo] = useState<Cafeteria>(cafeteria)

    // Real-time Subscription for New Orders
    useEffect(() => {
        const channel = supabase
            .channel('manager-dashboard')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `cafeteria_id=eq.${cafeteria.cafeteria_id}`
                },
                async (payload) => {
                    console.log('New order received!', payload)
                    showToast(`New Order #${payload.new.order_id} Received!`, 'info')

                    // Fetch the full order details including customer info
                    const { data: newOrder } = await supabase
                        .from('orders')
                        .select('*, customers(name, email)')
                        .eq('order_id', payload.new.order_id)
                        .single()

                    if (newOrder) {
                        setOrders(prev => [newOrder as Order, ...prev])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [cafeteria.cafeteria_id, supabase, showToast])

    // Edit States
    const [isEditingInfo, setIsEditingInfo] = useState(false)
    const [editedInfo, setEditedInfo] = useState<Cafeteria>(cafeteria)

    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
    const [menuForm, setMenuForm] = useState<Partial<Menu>>({
        menu_name: '',
        price: 0,
        description: '',
        image_url: '',
        daily_limit: 100,
        stock_status: 'IN_STOCK'
    })

    // --- Order Actions ---
    const updateOrderStatus = async (orderId: number, newStatus: Order['order_status']) => {
        const { error } = await supabase
            .from('orders')
            .update({ order_status: newStatus })
            .eq('order_id', orderId)

        if (!error) {
            setOrders(orders.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o))

            // Send Notification
            const order = orders.find(o => o.order_id === orderId)
            if (order && order.customer_id) {
                const message = `${t.incomingOrders} #${orderId}: ${t.status[newStatus]}`
                await supabase.from('notifications').insert({
                    customer_id: order.customer_id,
                    order_id: orderId,
                    message: message,
                    is_read: false
                })
            }
        } else {
            alert('Failed to update status')
        }
    }

    // --- Cafeteria Info Actions ---
    const handleSaveInfo = async () => {
        const { error } = await supabase
            .from('cafeterias')
            .update({
                name: editedInfo.name,
                location: editedInfo.location,
                operating_hours: editedInfo.operating_hours,
                status: editedInfo.status
            })
            .eq('cafeteria_id', cafeteriaInfo.cafeteria_id)

        if (!error) {
            setCafeteriaInfo(editedInfo)
            setIsEditingInfo(false)
        } else {
            alert('Failed to update info')
        }
    }

    // --- Menu Actions ---
    const handleOpenMenuModal = (menu?: Menu) => {
        if (menu) {
            setEditingMenu(menu)
            setMenuForm(menu)
        } else {
            setEditingMenu(null)
            setMenuForm({
                menu_name: '',
                price: 0,
                description: '',
                image_url: '',
                daily_limit: 100,
                stock_status: 'IN_STOCK'
            })
        }
        setIsMenuModalOpen(true)
    }

    const handleSaveMenu = async () => {
        if (editingMenu) {
            // Update
            const { error } = await supabase
                .from('menus')
                .update({
                    menu_name: menuForm.menu_name,
                    price: menuForm.price,
                    description: menuForm.description,
                    image_url: menuForm.image_url,
                    daily_limit: menuForm.daily_limit,
                    stock_status: menuForm.stock_status
                })
                .eq('menu_id', editingMenu.menu_id)

            if (!error) {
                setMenus(menus.map(m => m.menu_id === editingMenu.menu_id ? { ...m, ...menuForm } as Menu : m))
                setIsMenuModalOpen(false)
            } else {
                alert('Failed to update menu')
            }
        } else {
            // Create
            const { data, error } = await supabase
                .from('menus')
                .insert({
                    cafeteria_id: cafeteriaInfo.cafeteria_id,
                    menu_name: menuForm.menu_name!,
                    price: menuForm.price!,
                    description: menuForm.description,
                    image_url: menuForm.image_url,
                    daily_limit: menuForm.daily_limit,
                    stock_status: 'IN_STOCK'
                })
                .select()
                .single()

            if (!error && data) {
                setMenus([...menus, data as any]) // Type casting for simplicity
                setIsMenuModalOpen(false)
            } else {
                alert('Failed to create menu')
            }
        }
    }

    const handleDeleteMenu = async (menuId: number) => {
        if (!confirm(t.common.confirmDelete)) return

        const { error } = await supabase
            .from('menus')
            .delete()
            .eq('menu_id', menuId)

        if (!error) {
            setMenus(menus.filter(m => m.menu_id !== menuId))
        } else {
            alert('Failed to delete menu')
        }
    }

    const toggleStockStatus = async (menuId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK'
        const { error } = await supabase
            .from('menus')
            .update({ stock_status: newStatus })
            .eq('menu_id', menuId)

        if (!error) {
            setMenus(menus.map(m => m.menu_id === menuId ? { ...m, stock_status: newStatus as any } : m))
        } else {
            alert('Failed to update stock')
        }
    }

    // --- Sales Actions ---
    const handleCloseDay = async () => {
        if (!confirm(t.dashboard.closeDayConfirm)) return

        const today = new Date().toISOString().split('T')[0]
        const todaysOrders = orders.filter(o =>
            o.order_status === 'COMPLETED' &&
            o.created_at.startsWith(today)
        )

        const totalSalesAmount = todaysOrders.reduce((sum, o) => sum + o.total_amount, 0)

        // Calculate menu sales
        const menuSales: Record<string, number> = {}
        // Note: In a real app, we'd need to fetch order details for all these orders
        // For this MVP, we'll simplify and just store the total

        const { error } = await supabase
            .from('sales')
            .insert({
                cafeteria_id: cafeteriaInfo.cafeteria_id,
                sales_date: today,
                total_orders: todaysOrders.length,
                total_sales: totalSalesAmount,
                menu_sales_data: {}, // Placeholder
                hourly_sales_data: {} // Placeholder
            })

        if (!error) {
            alert(t.common.success)
        } else {
            console.error(error)
            alert('Failed to close day')
        }
    }

    // Calculate Sales
    const totalSales = orders
        .filter(o => o.order_status !== 'CANCELED')
        .reduce((sum, o) => sum + o.total_amount, 0)

    const totalOrdersCount = orders.length

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="glass sticky top-0 z-20 px-6 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{cafeteriaInfo.name}</h1>
                    <p className="text-sm text-gray-700">Manager Dashboard</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${cafeteriaInfo.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {cafeteriaInfo.status}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 p-4">
                <div className="glass p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-black mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-medium">Total Sales</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{totalSales.toLocaleString()}</p>
                </div>
                <div className="glass p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-black mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Orders</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{totalOrdersCount}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
                <div className="flex bg-white/50 p-1 rounded-xl glass overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-black text-white shadow-md' : 'text-black hover:text-gray-700'
                            }`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('menus')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'menus' ? 'bg-black text-white shadow-md' : 'text-black hover:text-gray-700'
                            }`}
                    >
                        Menus
                    </button>
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-black text-white shadow-md' : 'text-black hover:text-gray-700'
                            }`}
                    >
                        {t.dashboard.salesChart}
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'info' ? 'bg-black text-white shadow-md' : 'text-black hover:text-gray-700'
                            }`}
                    >
                        Info
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 space-y-4">
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-10 text-gray-600">No orders yet</div>
                        ) : (
                            orders.map(order => (
                                <div key={order.order_id} className="glass p-5 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">#{order.order_id}</span>
                                                <span className="text-sm text-gray-700">{new Date(order.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-800">{order.customers?.name || 'Guest'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.order_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            order.order_status === 'COOKING' ? 'bg-blue-100 text-blue-800' :
                                                order.order_status === 'READY' ? 'bg-green-100 text-green-800' :
                                                    order.order_status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {t.status[order.order_status] || order.order_status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="font-bold text-lg">{order.total_amount.toLocaleString()}</span>

                                        <div className="flex gap-2">
                                            {order.order_status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.order_id, 'CANCELED')}
                                                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateOrderStatus(order.order_id, 'COOKING')}
                                                        className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold shadow-lg"
                                                    >
                                                        Accept
                                                    </button>
                                                </>
                                            )}
                                            {order.order_status === 'COOKING' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.order_id, 'READY')}
                                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg"
                                                >
                                                    Ready
                                                </button>
                                            )}
                                            {order.order_status === 'READY' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.order_id, 'COMPLETED')}
                                                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold shadow-lg"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'menus' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => handleOpenMenuModal()}
                            className="w-full py-3 rounded-xl bg-black text-white font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            {t.dashboard.addMenu}
                        </button>

                        <div className="space-y-3">
                            {menus.map(menu => (
                                <div key={menu.menu_id} className="glass p-4 rounded-2xl space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{menu.menu_name}</h3>
                                            <p className="text-sm text-gray-700">{menu.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenMenuModal(menu)}
                                                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMenu(menu.menu_id)}
                                                className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-600 line-clamp-1">{menu.description}</p>
                                        <button
                                            onClick={() => toggleStockStatus(menu.menu_id, menu.stock_status)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${menu.stock_status === 'IN_STOCK'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {menu.stock_status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'sales' && (
                    <div className="space-y-6">
                        <div className="glass p-6 rounded-3xl space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-black">{t.dashboard.salesChart}</h2>
                                <div className="flex gap-2">
                                    <div className="bg-gray-100 p-1 rounded-lg flex">
                                        <button
                                            onClick={() => setChartPeriod('week')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartPeriod === 'week' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                                        >
                                            {t.dashboard.week}
                                        </button>
                                        <button
                                            onClick={() => setChartPeriod('month')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartPeriod === 'month' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                                        >
                                            {t.dashboard.month}
                                        </button>
                                        <button
                                            onClick={() => setChartPeriod('year')}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${chartPeriod === 'year' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                                        >
                                            {t.dashboard.year}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleCloseDay}
                                        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        {t.dashboard.closeDay}
                                    </button>
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-2 pt-10 pb-2 border-b border-gray-100">
                                {/* Mock Chart Bars based on Period */}
                                {chartPeriod === 'week' && (
                                    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                        const h = [40, 70, 45, 90, 60, 80, 50][i]
                                        return (
                                            <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-black rounded-t-lg transition-all duration-500 group-hover:bg-gray-800"
                                                    style={{ height: `${h}%` }}
                                                />
                                                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600">
                                                    {day}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}

                                {chartPeriod === 'month' && (
                                    Array.from({ length: 10 }).map((_, i) => { // Simplified 10 points for month
                                        const h = Math.floor(Math.random() * 80) + 20
                                        return (
                                            <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-black rounded-t-lg transition-all duration-500 group-hover:bg-gray-800"
                                                    style={{ height: `${h}%` }}
                                                />
                                                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600">
                                                    {i * 3 + 1}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}

                                {chartPeriod === 'year' && (
                                    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                                        const h = Math.floor(Math.random() * 80) + 20
                                        return (
                                            <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-black rounded-t-lg transition-all duration-500 group-hover:bg-gray-800"
                                                    style={{ height: `${h}%` }}
                                                />
                                                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600">
                                                    {month}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl space-y-4">
                            <h2 className="text-lg font-bold">{t.dashboard.topMenus}</h2>
                            <div className="space-y-3">
                                {menus.slice(0, 3).map((menu, i) => (
                                    <div key={menu.menu_id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </div>
                                            <span className="font-medium">{menu.menu_name}</span>
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {Math.floor(Math.random() * 50) + 10} orders
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <div className="glass p-6 rounded-3xl space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">{t.dashboard.editInfo}</h2>
                                {!isEditingInfo ? (
                                    <button
                                        onClick={() => setIsEditingInfo(true)}
                                        className="p-2 rounded-full bg-black text-white shadow-lg"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditingInfo(false)}
                                            className="p-2 rounded-full bg-gray-200 text-gray-600"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={handleSaveInfo}
                                            className="p-2 rounded-full bg-green-500 text-white shadow-lg"
                                        >
                                            <Save size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                    {isEditingInfo ? (
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-black"
                                            value={editedInfo.name || ''}
                                            onChange={e => setEditedInfo({ ...editedInfo, name: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-lg font-medium text-gray-900">{cafeteriaInfo.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.location}</label>
                                    {isEditingInfo ? (
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-black"
                                            value={editedInfo.location || ''}
                                            onChange={e => setEditedInfo({ ...editedInfo, location: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-lg font-medium text-gray-900">{cafeteriaInfo.location}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.operatingHours}</label>
                                    {isEditingInfo ? (
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-black"
                                            value={editedInfo.operating_hours || ''}
                                            onChange={e => setEditedInfo({ ...editedInfo, operating_hours: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-lg font-medium text-gray-900">{cafeteriaInfo.operating_hours}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => isEditingInfo ? setEditedInfo({ ...editedInfo, status: 'OPEN' }) : null}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${(isEditingInfo ? editedInfo.status : cafeteriaInfo.status) === 'OPEN'
                                                ? 'bg-green-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            OPEN
                                        </button>
                                        <button
                                            onClick={() => isEditingInfo ? setEditedInfo({ ...editedInfo, status: 'CLOSED' }) : null}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${(isEditingInfo ? editedInfo.status : cafeteriaInfo.status) === 'CLOSED'
                                                ? 'bg-red-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            CLOSED
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Modal */}
            {isMenuModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingMenu ? t.dashboard.editMenu : t.dashboard.addMenu}</h3>
                            <button onClick={() => setIsMenuModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.menuName}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                                    value={menuForm.menu_name || ''}
                                    onChange={e => setMenuForm({ ...menuForm, menu_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.price}</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                                    value={menuForm.price || 0}
                                    onChange={e => setMenuForm({ ...menuForm, price: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.description}</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                                    value={menuForm.description || ''}
                                    onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                                    value={menuForm.image_url || ''}
                                    onChange={e => setMenuForm({ ...menuForm, image_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.dashboard.dailyLimit}</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                                    value={menuForm.daily_limit || 0}
                                    onChange={e => setMenuForm({ ...menuForm, daily_limit: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <button
                                onClick={handleSaveMenu}
                                className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg mt-4"
                            >
                                {t.common.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
