import Link from 'next/link'
import { createClient } from '../lib/supabase/server-client'
import { redirect } from 'next/navigation'
import { LogOut, User, LayoutDashboard, Database, FileText, ArrowLeft, Factory, ChevronRight } from 'lucide-react'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ planta?: string, action?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { planta, action = 'view' } = await searchParams

  if (!user) {
    redirect('/login')
  }

  // Si no hay planta seleccionada, redirigir a la selección de plantas
  if (!planta) {
    redirect('/plants')
  }

  // Obtener HDTs de la planta seleccionada
  const { data: hdts, error } = await (supabase
    .from('hdts')
    .select('*')
    .ilike('planta', planta)
    .order('codigo', { ascending: true }) as any)

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
        <Link
          href="/plants"
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-normal tracking-tight">
            HDT's de {planta}
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-12">
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <FileText className="h-8 w-8 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-brand-primary">Listado de HDTs</h2>
                <p className="text-zinc-500 font-medium">Gestiona las hojas de división de trabajo para esta planta</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
              <User className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{user.email?.split('@')[0]}</span>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
              <p className="text-red-600 font-medium">Error al cargar las HDTs. Por favor intenta de nuevo.</p>
            </div>
          ) : hdts?.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-20 flex flex-col items-center text-center space-y-4">
              <FileText className="h-16 w-16 text-zinc-200" />
              <p className="text-zinc-500 text-xl font-medium">No hay HDTs registradas para la planta <span className="text-brand-primary font-bold">{planta}</span>.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {hdts?.map((hdt: any) => (
                <Link
                  key={hdt.id}
                  href={`/hdt/${action === 'edit' ? 'edit' : 'view'}/${hdt.id}`}
                  className="bg-white border-2 border-brand-primary/5 hover:border-brand-primary p-6 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-1 flex-shrink-0 bg-brand-primary rounded-full group-hover:scale-y-110 transition-transform"></div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                        HDT's de {hdt.labor || hdt.proceso || hdt.codigo}
                      </h3>
                      <p className="text-zinc-400 text-sm font-medium mt-1">
                        Código: <span className="text-zinc-600 font-bold uppercase">{hdt.codigo}</span> {!hdt.is_current && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] items-center italic">OBSOLETO</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1 group-hover:text-brand-primary transition-colors">
                        Click para {action === 'edit' ? 'Editar' : 'Ver'}
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all text-zinc-400">
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
