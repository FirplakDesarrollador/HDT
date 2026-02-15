'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutGrid, Plus, Home, ChevronRight, Edit3 } from 'lucide-react'
import { createClient } from '../../lib/supabase/browser-client'

export default function MenuPage() {
    const [userName, setUserName] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                // Extraer el nombre del correo (ej: jakeline.chaverra -> Jakeline)
                const namePart = user.email.split('@')[0].split('.')[0]
                const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()
                setUserName(capitalized)
            }
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const menuItems = [
        {
            title: 'Ver HDTs creadas',
            image: '/brand/lista.avif',
            action: () => router.push('/plants?action=view'),
        },
        {
            title: 'Editar una HDT',
            icon: <Edit3 className="h-10 w-10 text-brand-primary" />,
            action: () => router.push('/plants?action=edit'),
        },
        {
            title: 'Crear una nueva HDT',
            icon: <Plus className="h-10 w-10 text-brand-primary" />,
            action: () => router.push('/hdt/create'),
        },
    ]

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12 relative">
            {/* Top Navigation / Brand */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
                <img
                    src="/brand/logo_2.png"
                    alt="Firplak Logo"
                    className="h-20 w-auto object-contain"
                />

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-zinc-500 hover:text-brand-primary transition-colors font-bold text-sm"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
            </div>

            <div className="w-full max-w-6xl mt-12 flex justify-center">
                {/* Main Content Area */}
                <div className="flex flex-col items-center text-center space-y-10 w-full max-w-4xl">
                    {/* Dynamic Greeting */}
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
                            ¡Hola {userName}!
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-primary">
                            ¿Qué quieres hacer?
                        </h2>
                    </div>

                    {/* Menu Buttons Area */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="flex flex-col items-center justify-center border-2 border-brand-primary/10 p-8 rounded-3xl hover:bg-zinc-50 hover:border-brand-primary transition-all group space-y-4 shadow-sm hover:shadow-md bg-white min-h-[220px]"
                            >
                                <div className="h-24 flex items-center justify-center">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="h-20 w-auto object-contain group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="p-4 bg-brand-primary/5 rounded-2xl group-hover:bg-brand-primary/10 transition-colors">
                                            {item.icon}
                                        </div>
                                    )}
                                </div>
                                <span className="text-brand-primary font-bold text-xl leading-snug">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Centered Footer */}
            <div className="mt-16 flex flex-col items-center">
                <p className="text-brand-primary/40 text-xs font-bold tracking-[0.2em] uppercase text-center">
                    FIRPLAK S.A. | Inspirando Hogares | Estandarización HDT
                </p>
            </div>
        </div>
    )
}
