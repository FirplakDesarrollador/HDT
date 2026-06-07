'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/browser-client'
import { isAuthorizedEditor } from '../../../../lib/authorized-editors'
import HdtForm from '../../../../components/HdtForm'
import { Loader2, ShieldX } from 'lucide-react'

interface EditHdtPageProps {
    params: Promise<{
        id: string
    }>
}

export default function EditHdtPage({ params }: EditHdtPageProps) {
    const { id } = use(params)
    const router = useRouter()
    const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

    useEffect(() => {
        const checkAccess = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (isAuthorizedEditor(user?.email)) {
                setAuthState('authorized')
            } else {
                setAuthState('unauthorized')
                setTimeout(() => router.replace('/menu'), 2500)
            }
        }
        checkAccess()
    }, [router])

    if (authState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
                <p className="text-zinc-500 font-medium">Verificando permisos...</p>
            </div>
        )
    }

    if (authState === 'unauthorized') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center p-8">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
                    <ShieldX className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-800">Acceso Denegado</h2>
                <p className="text-zinc-500 max-w-sm">No tienes permisos para editar HDTs. Serás redirigido al menú...</p>
            </div>
        )
    }

    return <HdtForm mode="edit" hdtId={id} />
}
