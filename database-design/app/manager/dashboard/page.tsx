import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ManagerDashboardClient from '@/components/ManagerDashboardClient'

export default async function ManagerDashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch manager profile
    const { data: manager } = await supabase
        .from('managers')
        .select('*')
        .eq('manager_id', user.id)
        .single()

    if (!manager) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="glass p-8 rounded-3xl text-center max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You are not registered as a manager.</p>
                </div>
            </div>
        )
    }

    // Fetch cafeteria info
    const { data: cafeteria } = await supabase
        .from('cafeterias')
        .select('*')
        .eq('cafeteria_id', manager.cafeteria_id!)
        .single()

    // Fetch orders
    const { data: orders } = await supabase
        .from('orders')
        .select('*, customers(name, email)')
        .eq('cafeteria_id', manager.cafeteria_id!)
        .order('created_at', { ascending: false })

    // Fetch menus
    const { data: menus } = await supabase
        .from('menus')
        .select('*')
        .eq('cafeteria_id', manager.cafeteria_id!)
        .order('menu_name')

    return (
        <ManagerDashboardClient
            initialOrders={orders || []}
            initialMenus={menus || []}
            cafeteria={cafeteria}
        />
    )
}
