'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, LogIn, AlertCircle, EyeOff, Eye } from 'lucide-react'
import { createClient } from '../../lib/supabase/browser-client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) {
                setError(loginError.message)
            } else {
                router.push('/menu')
                router.refresh()
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="transition-transform hover:scale-105">
                            <img
                                src="/brand/logo_2.png"
                                alt="Firplak Logo"
                                className="h-28 w-auto object-contain"
                            />
                        </div>
                    </div>
                    <div className="mt-8 space-y-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">
                            App Gestor HDT's
                        </h1>
                        <p className="text-xl md:text-2xl font-normal text-brand-primary">
                            ¡Bienvenido!
                        </p>
                    </div>
                </div>

                <form className="mt-12 space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="email" className="sr-only">Correo electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-2xl border-0 bg-zinc-100 py-4 px-6 text-brand-primary placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary/20 sm:text-sm font-medium transition-all"
                                placeholder="Email"
                            />
                        </div>
                        <div className="relative group">
                            <label htmlFor="password-login" className="sr-only">Contraseña</label>
                            <input
                                id="password-login"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-2xl border-0 bg-zinc-100 py-4 px-6 text-brand-primary placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-primary/20 sm:text-sm font-medium transition-all"
                                placeholder="Password"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-zinc-500 hover:text-brand-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <Eye className="h-5 w-5" />
                                    ) : (
                                        <EyeOff className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-600 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-2xl bg-brand-primary px-4 py-4 text-lg font-bold text-white transition-all hover:bg-brand-secondary hover:shadow-lg focus:outline-none disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                'Ingresar'
                            )}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="text-brand-primary font-medium hover:text-brand-secondary hover:underline transition-all inline-block py-2"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-widest font-medium">
                        © 2026 FIRPLAK S.A.
                    </p>
                </div>
            </div>
        </div>
    )
}
