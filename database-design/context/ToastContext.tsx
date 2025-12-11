'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
    id: number
    message: string
    type: ToastType
}

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`glass flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all animate-in slide-in-from-right-full ${toast.type === 'success' ? 'bg-green-50/80 border-green-200 text-green-800' :
                                toast.type === 'error' ? 'bg-red-50/80 border-red-200 text-red-800' :
                                    'bg-white/80 border-gray-200 text-gray-800'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle size={18} className="text-green-600" />}
                        {toast.type === 'error' && <AlertCircle size={18} className="text-red-600" />}
                        {toast.type === 'info' && <Info size={18} className="text-blue-600" />}

                        <p className="text-sm font-medium">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
