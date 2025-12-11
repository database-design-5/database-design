'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

type Cafeteria = {
    cafeteria_id: number
    name: string
}

export default function ManagerRegisterPage() {
    const [isVerified, setIsVerified] = useState(false)
    const [adminPassword, setAdminPassword] = useState('')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [selectedCafeteria, setSelectedCafeteria] = useState<string>('')
    const [cafeterias, setCafeterias] = useState<Cafeteria[]>([])

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLanguage()

    useEffect(() => {
        const fetchCafeterias = async () => {
            const { data } = await supabase.from('cafeterias').select('cafeteria_id, name')
            if (data) {
                setCafeterias(data)
                if (data.length > 0) setSelectedCafeteria(data[0].cafeteria_id.toString())
            }
        }
        fetchCafeterias()
    }, [])

    const handleAdminCheck = (e: React.FormEvent) => {
        e.preventDefault()
        if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setIsVerified(true)
            setMessage(null)
        } else {
            setMessage(t.auth.invalidAdminPassword)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                    data: {
                        name: name,
                        phone_number: phoneNumber,
                        role: 'manager' // Optional: Add role metadata
                    },
                },
            })

            if (error) {
                setMessage(error.message)
            } else {
                if (data.user) {
                    // Insert into managers table
                    const { error: managerError } = await supabase
                        .from('managers')
                        .insert({
                            manager_id: data.user.id,
                            cafeteria_id: parseInt(selectedCafeteria),
                            name: name,
                            phone_number: phoneNumber,
                        })

                    if (managerError) {
                        console.error('Error creating manager record:', managerError)
                        setMessage('Error creating manager record: ' + managerError.message)
                    } else {
                        setMessage(t.auth.registerSuccess)
                    }
                }
            }
        } catch (error: any) {
            setMessage(t.auth.error)
        } finally {
            setLoading(false)
        }
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                    <LanguageSelector />
                </div>
                <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.auth.managerRegister}</h1>
                        <p className="text-gray-700 text-sm">Please enter admin password</p>
                    </div>
                    <form onSubmit={handleAdminCheck} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.auth.adminPassword}
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-black"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-800 transition-all"
                        >
                            {t.auth.verify}
                        </button>
                        {message && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm text-center">
                                {message}
                            </div>
                        )}
                    </form>
                    <div className="mt-6 text-center">
                        <Link href="/register" className="text-sm text-gray-700 hover:text-black">
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
            <div className="absolute top-4 right-4 z-20">
                <LanguageSelector />
            </div>

            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 my-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Cafeteria</h1>
                    <h2 className="text-xl font-medium text-gray-800">{t.auth.managerRegister}</h2>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.selectCafeteria}
                        </label>
                        <select
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black outline-none appearance-none"
                            value={selectedCafeteria}
                            onChange={(e) => setSelectedCafeteria(e.target.value)}
                        >
                            {cafeterias.map(caf => (
                                <option key={caf.cafeteria_id} value={caf.cafeteria_id}>
                                    {caf.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.name}
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            autoComplete="name"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-black"
                            placeholder={t.auth.name}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.phoneNumber}
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            autoComplete="tel"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-black"
                            placeholder="010-0000-0000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.email}
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-black"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.password}
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black outline-none text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-800 transition-all disabled:bg-gray-400 active:scale-[0.98]"
                    >
                        {loading ? t.orderProcessing : t.auth.registerButton}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm text-center ${message.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message}
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm text-gray-700 hover:text-black transition-colors">
                        {t.auth.haveAccount}
                    </Link>
                </div>
            </div>
        </div>
    )
}
