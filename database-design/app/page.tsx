import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if user is a manager
    const { data: manager } = await supabase
      .from('managers')
      .select('manager_id')
      .eq('manager_id', user.id)
      .single()

    if (manager) {
      redirect('/manager/dashboard')
    } else {
      redirect('/cafeterias')
    }
  } else {
    redirect('/login')
  }
}
