import Link from 'next/link'
import { createClient } from '../lib/supabase/server-client'
import { redirect } from 'next/navigation'
import { LogOut, User, FileText, ArrowLeft, ChevronRight, Search, Home } from 'lucide-react'
import { Database } from '../lib/supabase/database.types'
import GroupedHdtList from '../components/GroupedHdtList'

type HdtRow = Database['public']['Tables']['hdts']['Row']

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ planta?: string, action?: string, showObsolete?: string, query?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { planta, action = 'view', showObsolete, query = '' } = await searchParams
  const isShowObsolete = showObsolete === 'true'

  if (!user) {
    redirect('/login')
  }

  // Si no hay planta seleccionada, redirigir a la selección de plantas
  if (!planta) {
    redirect('/plants')
  }

  // Obtener HDTs de la planta seleccionada (todas las versiones para permitir ver historial contextualmente)
  const { data: hdts, error } = await supabase
    .from('hdts')
    .select('*')
    .ilike('planta', planta)
    .order('proceso', { ascending: true })
    .order('codigo', { ascending: true })
    .order('version', { ascending: false })


  // Filtrar por búsqueda si existe
  const filteredHdts = query
    ? (hdts as HdtRow[])?.filter(hdt =>
      (hdt.labor?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (hdt.proceso?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (hdt.codigo?.toLowerCase() || '').includes(query.toLowerCase())
    )
    : (hdts as HdtRow[])

  // Agrupar por proceso
  const groupedHdts = filteredHdts?.reduce((acc, hdt) => {
    const proceso = hdt.proceso || 'Sin Proceso'
    if (!acc[proceso]) acc[proceso] = []
    acc[proceso].push(hdt)
    return acc
  }, {} as Record<string, HdtRow[]>)

  if (error) {
    console.error('Supabase error in Home:', error)
  }

  const handleSignOut = async () => {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Dark Header */}
      <header className="bg-brand-primary p-4 flex items-center shadow-md relative z-10 text-white">
        <div className="flex items-center gap-1">
          <Link
            href="/plants"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Volver"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <Link
            href="/menu"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Ir al Menú Principal"
          >
            <Home className="h-6 w-6" />
          </Link>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-normal tracking-tight">
            HDTs de {planta}
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-12">
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 pb-6 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <FileText className="h-8 w-8 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-brand-primary">Listado de HDTs</h2>
                <p className="text-zinc-500 font-medium">Gestiona las hojas de división de trabajo para esta planta</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <form action="/" method="get" className="flex items-center">
                  <input type="hidden" name="planta" value={planta} />
                  <input type="hidden" name="action" value={action} />
                  <input type="hidden" name="showObsolete" value={showObsolete || 'false'} />
                  <input
                    type="text"
                    name="query"
                    defaultValue={query}
                    placeholder="Buscar por labor o proceso..."
                    className="w-full bg-white border-2 border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all outline-none"
                  />
                  <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                </form>
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                <User className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{user.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
              <p className="text-red-600 font-medium">Error al cargar las HDTs. Por favor intenta de nuevo.</p>
            </div>
          ) : Object.keys(groupedHdts || {}).length === 0 ? (
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-20 flex flex-col items-center text-center space-y-4">
              <FileText className="h-16 w-16 text-zinc-200" />
              <p className="text-zinc-500 text-xl font-medium">No se encontraron HDTs para esta búsqueda.</p>
            </div>
          ) : (
            <GroupedHdtList groupedHdts={groupedHdts || {}} action={action} />
          )}
        </div>
      </main>

      <footer className="p-8 border-t border-zinc-100 flex flex-col items-center gap-4">
        <form action={handleSignOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión de {user.email}</span>
          </button>
        </form>
        <p className="text-zinc-300 text-[10px] font-bold tracking-[0.3em] uppercase">
          FIRPLAK S.A. | GESTIÓN CALIDAD | 2026
        </p>
      </footer>
    </div>
  )
}
