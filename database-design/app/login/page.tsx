'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()
    const { t } = useLanguage()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(error.message)
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-gray-200 to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-gray-300 to-transparent rounded-full blur-3xl opacity-50" />

            <div className="absolute top-4 right-4 z-20">
                <LanguageSelector />
            </div>

            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Cafeteria</h1>
                    <h2 className="text-xl font-medium text-gray-800">{t.auth.login}</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
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
                            autoComplete="current-password"
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
                        {loading ? t.orderProcessing : t.auth.loginButton}
                    </button>

                    {message && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm text-center">
                            {message}
                        </div>
                    )}
                </form>

                <div className="mt-8 text-center">
                    <Link href="/register" className="text-sm text-gray-700 hover:text-black transition-colors">
                        {t.auth.noAccount}
                    </Link>
                </div>
            </div>
        </div>
    )
}
