'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '../../lib/supabase/browser-client'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else {
                setMessage({ type: 'success', text: 'Te hemos enviado un correo electrónico con un enlace para restablecer tu contraseña.' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Ocurrió un error inesperado. Por favor intenta de nuevo.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            {/* Dark Header */}
            <header className="bg-brand-primary p-4 flex items-center shadow-md relative z-10">
                <button
                    onClick={() => router.push('/login')}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="text-white text-2xl font-normal tracking-tight">
                        Cambia Contraseña
                    </h1>
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-20 p-6 sm:p-12">
                <div className="w-full max-w-xl space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-normal text-zinc-700">
                            Olvidé mi contraseña
                        </h2>
                        <p className="text-zinc-500 text-lg leading-snug">
                            Te enviaremos un correo electrónico con un enlace para restablecer tu contraseña. Por favor, ingresa el correo electrónico asociado a tu cuenta:
                        </p>
                    </div>

                    <form className="space-y-8 flex flex-col items-center" onSubmit={handleResetPassword}>
                        <div className="w-full">
                            <input
                                id="email-recovery"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border border-zinc-200 bg-white py-4 px-6 text-zinc-800 placeholder:text-zinc-400 focus:border-brand-primary focus:ring-0 text-xl font-normal shadow-sm transition-all"
                                placeholder="Correo"
                            />
                        </div>

                        {message && (
                            <div className={`w-full flex items-center gap-3 rounded-xl p-5 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
                                <p className="text-lg">{message.text}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="min-w-[180px] flex justify-center rounded-xl bg-brand-primary px-8 py-4 text-xl font-normal text-white transition-all hover:bg-brand-secondary shadow-md hover:shadow-lg disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    'Recuperar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
