'use client'

import { useLanguage, Language } from '@/context/LanguageContext'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const languages: { code: Language; label: string }[] = [
        { code: 'KO', label: '한국어' },
        { code: 'EN', label: 'English' },
        { code: 'ZH', label: '中文' },
        { code: 'JA', label: '日本語' },
    ]

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white/80 transition-colors"
            >
                <Globe size={16} />
                <span>{languages.find(l => l.code === language)?.label}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-32 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${language === lang.code
                                        ? 'bg-gray-100 font-bold text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
