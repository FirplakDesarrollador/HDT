'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Factory, Loader2, ChevronRight, AlertCircle, LayoutGrid } from 'lucide-react'
import { createClient } from '../../lib/supabase/browser-client'
import { Database } from '../../lib/supabase/database.types'

export default function PlantsPage() {
    const [plants, setPlants] = useState<string[]>([])
    const [totalCount, setTotalCount] = useState<number | null>(null)
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const action = searchParams.get('action') || 'view'
    const supabase = createClient()

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                setLoading(true)
                setError(null)
                setDebugInfo(null)

                // Verificar usuario
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                    router.push('/login')
                    return
                }

                // Consultar todas las filas
                const { data, error: fetchError } = await (supabase
                    .from('hdts')
                    .select('*') as any)

                if (fetchError) {
                    setDebugInfo({ error: fetchError })
                    throw fetchError
                }

                setDebugInfo({
                    rowsFound: data?.length || 0,
                    firstRowKeys: data?.[0] ? Object.keys(data[0]) : [],
                    userId: user.id
                })

                if (data) {
                    setTotalCount(data.length)

                    // Buscar columna de planta (insensible a mayúsculas)
                    const firstRow = data[0]
                    const plantaKey = firstRow ? Object.keys(firstRow).find(key => key.toLowerCase() === 'planta') : 'planta'

                    const uniquePlants = Array.from(new Set(
                        data.map((item: any) => item[plantaKey || 'planta'])
                            .filter((p: any) => p !== null && p !== undefined && String(p).trim() !== '')
                    )) as string[]

                    setPlants(uniquePlants.sort())
                }
            } catch (err: any) {
                console.error('Error fetching plants:', err)
                setError(`Error de datos: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchPlants()
    }, [supabase, router])

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
            {/* Dark Header */}
            <header className="bg-brand-primary p-4 flex items-center shadow-md relative z-10">
                <button
                    onClick={() => router.push('/menu')}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="text-white text-2xl font-normal tracking-tight">
                        Selecciona Planta
                    </h1>
                </div>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-12">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-zinc-200 pb-6">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl">
                            <Factory className="h-8 w-8 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-brand-primary">Plantas disponibles</h2>
                            <p className="text-zinc-500 font-medium">Selecciona una planta para ver su listado de HDTs</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
                            <p className="text-zinc-500 font-medium animate-pulse">Consultando base de datos...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 flex flex-col items-center text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <p className="text-red-700 text-lg font-medium">{error}</p>
                            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Reintentar</button>
                        </div>
                    ) : plants.length === 0 ? (
                        <div className="space-y-6">
                            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-16 flex flex-col items-center text-center space-y-6">
                                <div className="p-5 bg-amber-50 rounded-full">
                                    <LayoutGrid className="h-12 w-12 text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-zinc-500 text-xl font-bold">No se encontraron plantas disponibles.</p>
                                    <p className="text-zinc-400 font-medium max-w-md">
                                        {totalCount === 0
                                            ? "La base de datos respondió correctamente, pero la tabla está vacía (0 registros detectados)."
                                            : `Se encontraron ${totalCount} registros, pero no logramos identificar el nombre de la planta.`}
                                    </p>
                                    {totalCount === 0 && (
                                        <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-left">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">💡 Posible causa:</p>
                                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                                Si en Supabase ves datos pero aquí sale "0 registros", es muy probable que sea un tema de **permisos (RLS)**. Debes agregar una política de "SELECT" para usuarios autenticados.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Technical Details Panel */}
                            <div className="bg-zinc-100/50 rounded-2xl p-6 border border-zinc-200">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Detalles técnicos para soporte</h3>
                                <pre className="text-[10px] sm:text-xs font-mono bg-zinc-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plants.map((planta) => (
                                <button
                                    key={planta}
                                    onClick={() => router.push(`/?planta=${encodeURIComponent(planta)}&action=${action}`)}
                                    className="group bg-white border-2 border-brand-primary/5 p-8 rounded-3xl flex items-center justify-between hover:border-brand-primary hover:bg-zinc-50 hover:shadow-xl transition-all duration-300 text-left"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                                            <Factory className="h-7 w-7 text-brand-primary group-hover:text-white" />
                                        </div>
                                        <span className="text-xl font-bold text-brand-primary group-hover:translate-x-1 transition-transform duration-300 capitalize">
                                            {planta.toLowerCase()}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-zinc-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-8 text-center bg-transparent">
                <p className="text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase">
                    Firplak S.A. | Planta de Producción
                </p>
            </footer>
        </div>
    )
}
