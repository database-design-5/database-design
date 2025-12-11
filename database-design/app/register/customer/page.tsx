'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLanguage()

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
                    },
                },
            })

            if (error) {
                setMessage(error.message)
            } else {
                // Create customer record immediately
                if (data.user) {
                    const { error: customerError } = await supabase
                        .from('customers')
                        .insert({
                            customer_id: data.user.id,
                            email: email,
                            name: name,
                            phone_number: phoneNumber,
                        })

                    if (customerError) {
                        console.error('Error creating customer record:', customerError)
                    }
                }
                setMessage(t.auth.registerSuccess)
            }
        } catch (error: any) {
            setMessage(t.auth.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-gray-200 to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-gray-300 to-transparent rounded-full blur-3xl opacity-50" />

            <div className="absolute top-4 right-4 z-20">
                <LanguageSelector />
            </div>

            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Cafeteria</h1>
                    <h2 className="text-xl font-medium text-gray-800">{t.auth.register}</h2>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.password}
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none text-black"
                            placeholder="••••••••"
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
