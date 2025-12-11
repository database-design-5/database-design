import { createClient } from '@/utils/supabase/server'
import CafeteriaMenu from '@/components/CafeteriaMenu'

export default async function CafeteriasPage() {
    const supabase = await createClient()

    const { data: cafeterias } = await supabase
        .from('cafeterias')
        .select('*')
        .order('name')

    const { data: menus } = await supabase
        .from('menus')
        .select('*')
        .order('menu_name')

    return (
        <main className="min-h-screen bg-gray-50">
            <CafeteriaMenu
                cafeterias={cafeterias || []}
                menus={menus || []}
            />
        </main>
    )
}
