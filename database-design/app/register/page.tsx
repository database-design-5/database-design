'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function RegisterSelectionPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-gray-200 to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-gray-300 to-transparent rounded-full blur-3xl opacity-50" />

            <div className="absolute top-4 right-4 z-20">
                <LanguageSelector />
            </div>

            <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Cafeteria</h1>
                <h2 className="text-xl font-medium text-gray-600 mb-8">{t.auth.registerTypeSelect}</h2>

                <div className="space-y-4">
                    <Link
                        href="/register/customer"
                        className="block w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        {t.auth.customerRegister}
                    </Link>

                    <Link
                        href="/register/manager"
                        className="block w-full bg-white text-black border-2 border-black font-bold py-4 rounded-xl shadow-lg hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        {t.auth.managerRegister}
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-black transition-colors">
                        {t.auth.haveAccount}
                    </Link>
                </div>
            </div>
        </div>
    )
}
