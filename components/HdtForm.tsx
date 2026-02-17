'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Search, X, User } from 'lucide-react'
import { createClient } from '../lib/supabase/browser-client'
import { createTHClient } from '../lib/supabase/th-client'
import { Database } from '../lib/supabase/database.types'

type HdtRow = Database['public']['Tables']['hdts']['Row']
type StepRow = Database['public']['Tables']['hdt_steps']['Row']

const PLANTAS = [
    'Marmol sintetico', 'Fibra de vidrio', 'Muebles', 'CEFI', 'RTM',
    'Quarzstone', 'Fabricación de moles', 'Reparación de moldes',
    'Calidad', 'Mantenimiento', 'Servicios'
]

const EPP_OPTIONS = [
    'Protección auditiva', 'Gafas', 'Botas de seguridad', 'Guantes de nitrilo', 'Guantes de carnaza',
    'Mangas', 'Delantal', 'Media cara', 'Tapabocas', 'Mascarilla', 'Casco'
]

function NumberedTextarea({ value, onChange, readOnly, placeholder, name, onStepChange, index, minHeight = 'min-h-[80px]' }: any) {
    const lines = value ? value.split('\n') : [''];

    return (
        <div className={`flex gap-3 w-full h-full ${minHeight} p-3 transition-colors ${readOnly ? 'bg-zinc-50/50' : 'bg-transparent hover:bg-zinc-50/30'}`}>
            <div className="flex flex-col text-[10px] font-bold text-zinc-400 select-none text-right min-w-[14px] opacity-60 leading-5 pt-[3px]">
                {lines.map((_: any, i: number) => (
                    <div key={i} className="h-5 flex items-center justify-end">{i + 1}.</div>
                ))}
            </div>
            <textarea
                name={name}
                readOnly={readOnly}
                value={value}
                onChange={(e) => onStepChange ? onStepChange(index, e) : onChange(e)}
                className="flex-1 bg-transparent focus:outline-none resize-none text-sm font-medium leading-5 p-0 placeholder:text-zinc-300 placeholder:italic"
                placeholder={placeholder}
            />
        </div>
    );
}

interface HdtFormProps {
    hdtId?: string
    mode: 'create' | 'edit' | 'view'
}

export default function HdtForm({ hdtId, mode }: HdtFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const thSupabase = createTHClient()
    const [loading, setLoading] = useState(mode === 'edit' || mode === 'view')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    // Form State
    const [formData, setFormData] = useState<Partial<HdtRow>>({
        planta: '',
        labor: '',
        version: 1,
        fecha_elaboracion: new Date().toISOString().split('T')[0],
        elaboro: '',
        modifico: '',
        herramientas: '',
        insumos: '',
        epp: '',
        prohibido_y_porque: '',
        tratamiento_anomalias: '',
        codigo: ''
    })

    const [steps, setSteps] = useState<Partial<StepRow>[]>([
        { acciones_importantes: '', paso_importante: '', punto_clave: '', razon_punto_clave: '', step_no: 1 }
    ])

    // Search & Selection state
    const [laborSearch, setLaborSearch] = useState('')
    const [laborResults, setLaborResults] = useState<any[]>([])
    const [isSearchingLabor, setIsSearchingLabor] = useState(false)
    const [showLaborResults, setShowLaborResults] = useState(false)
    const laborRef = useRef<HTMLDivElement>(null)

    const [selectedEpps, setSelectedEpps] = useState<string[]>([])
    const [showEppDropdown, setShowEppDropdown] = useState(false)
    const eppRef = useRef<HTMLDivElement>(null)

    // TH Personnel states
    const [elaboroSearch, setElaboroSearch] = useState('')
    const [elaboroResults, setElaboroResults] = useState<any[]>([])
    const [isSearchingElaboro, setIsSearchingElaboro] = useState(false)
    const [showElaboroResults, setShowElaboroResults] = useState(false)
    const elaboroRef = useRef<HTMLDivElement>(null)

    const [modificoSearch, setModificoSearch] = useState('')
    const [modificoResults, setModificoResults] = useState<any[]>([])
    const [isSearchingModifico, setIsSearchingModifico] = useState(false)
    const [showModificoResults, setShowModificoResults] = useState(false)
    const modificoRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && hdtId) {
            fetchHdtData()
        }
    }, [hdtId, mode])

    const fetchHdtData = async () => {
        try {
            setLoading(true)
            // Fetch HDT header
            const { data: hdt, error: hdtError } = await supabase
                .from('hdts')
                .select('*')
                .eq('id', hdtId!)
                .single()

            if (hdtError) throw hdtError
            if (hdt) {
                setFormData(hdt)
                setLaborSearch(hdt.labor || '')
                setElaboroSearch(hdt.elaboro || '')
                setModificoSearch(hdt.modifico || '')
                if (hdt.epp) {
                    setSelectedEpps(hdt.epp.split(',').map(s => s.trim()))
                }
            }

            // Fetch HDT steps
            const { data: hdtSteps, error: stepsError } = await supabase
                .from('hdt_steps')
                .select('*')
                .eq('hdt_id', hdtId!)
                .order('step_no', { ascending: true })

            if (stepsError) throw stepsError
            if (hdtSteps && hdtSteps.length > 0) {
                setSteps(hdtSteps)
            }
        } catch (err: any) {
            console.error('Error fetching HDT:', err)
            setError('No se pudo cargar la información de la HDT.')
        } finally {
            setLoading(false)
        }
    }

    // Effect to handle clicking outside of dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (laborRef.current && !laborRef.current.contains(event.target as Node)) {
                setShowLaborResults(false)
            }
            if (eppRef.current && !eppRef.current.contains(event.target as Node)) {
                setShowEppDropdown(false)
            }
            if (elaboroRef.current && !elaboroRef.current.contains(event.target as Node)) {
                setShowElaboroResults(false)
            }
            if (modificoRef.current && !modificoRef.current.contains(event.target as Node)) {
                setShowModificoResults(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Real-time Labor Search
    useEffect(() => {
        const searchLabor = async () => {
            if (laborSearch.length < 2 || mode === 'view') {
                setLaborResults([])
                return
            }

            setIsSearchingLabor(true)
            try {
                // Search in products (sku and description)
                const { data: products } = await supabase
                    .from('productos')
                    .select('producto_sku, producto_descripcion')
                    .or(`producto_sku.ilike.%${laborSearch}%,producto_descripcion.ilike.%${laborSearch}%`)
                    .limit(10)

                setLaborResults(products || [])
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                setIsSearchingLabor(false)
            }
        }

        const timeoutId = setTimeout(searchLabor, 300)
        return () => clearTimeout(timeoutId)
    }, [laborSearch, mode])

    // Real-time Personnel Search (ELABORÓ)
    const [elaboroError, setElaboroError] = useState<string | null>(null)
    useEffect(() => {
        const searchPersonnel = async () => {
            if (mode === 'view') {
                setElaboroResults([])
                return
            }

            setIsSearchingElaboro(true)
            setElaboroError(null)
            try {
                console.log('🔍 Searching employees in TH database...')
                console.log('TH Client URL:', process.env.NEXT_PUBLIC_TH_SUPABASE_URL)

                let query = thSupabase
                    .from('empleados')
                    .select('id, nombreCompleto, cargo')

                if (elaboroSearch.length > 0) {
                    query = query.ilike('nombreCompleto', `%${elaboroSearch}%`)
                }

                const { data: employees, error: searchError } = await query

                if (searchError) {
                    console.error('❌ Personnel search query error:', searchError)
                    setElaboroError(searchError.message)
                } else {
                    console.log('✅ Found employees:', employees?.length)
                }
                setElaboroResults(employees || [])
            } catch (err: any) {
                console.error('Personnel search catch error:', err)
                setElaboroError(err.message || 'Error desconocido')
            } finally {
                setIsSearchingElaboro(false)
            }
        }

        const timeoutId = setTimeout(searchPersonnel, 300)
        return () => clearTimeout(timeoutId)
    }, [elaboroSearch, mode])

    // Real-time Personnel Search (APROBÓ)
    const [modificoError, setModificoError] = useState<string | null>(null)
    useEffect(() => {
        const searchPersonnel = async () => {
            if (mode === 'view') {
                setModificoResults([])
                return
            }

            setIsSearchingModifico(true)
            setModificoError(null)
            try {
                console.log('🔍 Searching employees for APROBÓ...')

                let query = thSupabase
                    .from('empleados')
                    .select('id, nombreCompleto, cargo')

                if (modificoSearch.length > 0) {
                    query = query.ilike('nombreCompleto', `%${modificoSearch}%`)
                }

                const { data: employees, error: searchError } = await query

                if (searchError) {
                    console.error('❌ Modifier personnel search query error:', searchError)
                    setModificoError(searchError.message)
                } else {
                    console.log('✅ Found employees for APROBÓ:', employees?.length)
                }
                setModificoResults(employees || [])
            } catch (err: any) {
                console.error('Modifier personnel search catch error:', err)
                setModificoError(err.message || 'Error desconocido')
            } finally {
                setIsSearchingModifico(false)
            }
        }

        const timeoutId = setTimeout(searchPersonnel, 300)
        return () => clearTimeout(timeoutId)
    }, [modificoSearch, mode])

    // Version automation
    useEffect(() => {
        if (mode === 'create' && formData.labor) {
            const checkVersion = async () => {
                const { count } = await supabase
                    .from('hdts')
                    .select('*', { count: 'exact', head: true })
                    .ilike('labor', formData.labor!)

                setFormData(prev => ({ ...prev, version: (count || 0) + 1 }))
            }
            checkVersion()
        }
    }, [formData.labor, mode])

    const toggleEpp = (epp: string) => {
        if (mode === 'view') return
        setSelectedEpps(prev => {
            let next
            if (prev.includes(epp)) {
                next = prev.filter(item => item !== epp)
            } else {
                next = [...prev, epp]
            }
            setFormData(f => ({ ...f, epp: next.join(', ') }))
            return next
        })
    }

    const selectLabor = (res: any) => {
        setFormData(prev => ({
            ...prev,
            labor: res.producto_descripcion,
            codigo: res.producto_sku
        }))
        setLaborSearch(res.producto_descripcion)
        setShowLaborResults(false)
    }

    const selectElaboro = (emp: any) => {
        setFormData(prev => ({ ...prev, elaboro: emp.nombreCompleto }))
        setElaboroSearch(emp.nombreCompleto)
        setShowElaboroResults(false)
    }

    const selectModifico = (emp: any) => {
        setFormData(prev => ({ ...prev, modifico: emp.nombreCompleto }))
        setModificoSearch(emp.nombreCompleto)
        setShowModificoResults(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleStepChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target
        const newSteps = [...steps]
        newSteps[index] = { ...newSteps[index], [name]: value }
        setSteps(newSteps)
    }

    const addStep = () => {
        setSteps([...steps, { acciones_importantes: '', paso_importante: '', punto_clave: '', razon_punto_clave: '', step_no: steps.length + 1 }])
    }

    const removeStep = (index: number) => {
        if (steps.length > 1) {
            const newSteps = steps.filter((_, i) => i !== index)
            // Re-order step_no
            const reorderedSteps = newSteps.map((step, i) => ({ ...step, step_no: i + 1 }))
            setSteps(reorderedSteps)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            // 1. Save Header
            let savedHdtId = hdtId
            if (mode === 'create') {
                const { data, error: hdtError } = await (supabase
                    .from('hdts')
                    .insert([{ ...formData, codigo: formData.codigo || `HDT-${Date.now()}` }])
                    .select()
                    .single() as any)

                if (hdtError) throw hdtError
                savedHdtId = data.id
            } else {
                const { error: hdtError } = await (supabase
                    .from('hdts')
                    .update(formData as any)
                    .eq('id', hdtId!) as any)

                if (hdtError) throw hdtError
            }

            // 2. Save Steps
            // Logic: Delete existing steps and insert new ones (simpler for MVP)
            if (mode === 'edit') {
                const { error: delError } = await (supabase
                    .from('hdt_steps')
                    .delete()
                    .eq('hdt_id', savedHdtId!) as any)
                if (delError) throw delError
            }

            const stepsToInsert = steps.map(step => ({
                hdt_id: savedHdtId!,
                acciones_importantes: step.acciones_importantes || '',
                paso_importante: step.paso_importante || '',
                punto_clave: step.punto_clave || '',
                razon_punto_clave: step.razon_punto_clave || '',
                step_no: step.step_no
            }))

            const { error: insError } = await (supabase
                .from('hdt_steps')
                .insert(stepsToInsert) as any)

            if (insError) throw insError

            setSuccess(true)
            setTimeout(() => {
                router.push('/menu')
            }, 2000)

        } catch (err: any) {
            console.error('Error saving HDT:', err)
            setError(err.message || 'Error inesperado al guardar.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
                <p className="text-zinc-500 font-medium">Cargando formulario...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-zinc-50 min-h-screen text-zinc-900">
            {/* Header Section */}
            <header className="bg-white border-2 border-brand-primary/20 rounded-t-3xl p-6 mb-0 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="flex-shrink-0">
                    <img src="/brand/logo_2.png" alt="Firplak Logo" className="h-16 w-auto" />
                </div>
                <div className="flex-1 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-primary uppercase tracking-wider">
                        Hoja de División de Trabajo HDT
                    </h1>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Information Grid - Styled as a Table */}
                <div className="bg-white border-x-2 border-b-2 border-brand-primary/20 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-x-2 divide-brand-primary/10">
                        {/* Column 1 */}
                        <div className="divide-y-2 divide-brand-primary/5">
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-20">Planta</label>
                                <select
                                    name="planta"
                                    disabled={mode === 'view'}
                                    value={formData.planta || ''}
                                    onChange={(e) => handleInputChange(e as any)}
                                    className={`flex-1 bg-zinc-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs appearance-none ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                    required
                                >
                                    <option value="">Seleccionar Planta...</option>
                                    {PLANTAS.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 relative">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-20">Labor</label>
                                <div className="flex-1 relative" ref={laborRef}>
                                    <div className="relative">
                                        <input
                                            name="labor"
                                            readOnly={mode === 'view'}
                                            value={laborSearch}
                                            onChange={(e) => {
                                                setLaborSearch(e.target.value)
                                                setFormData(prev => ({ ...prev, labor: e.target.value }))
                                                setShowLaborResults(true)
                                            }}
                                            onFocus={() => setShowLaborResults(true)}
                                            className={`w-full bg-zinc-50 border-none rounded-lg p-1.5 pr-8 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                            placeholder="Buscar producto o labor..."
                                            required
                                        />
                                        {isSearchingLabor ? (
                                            <Loader2 className="absolute right-2.5 top-1.5 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                                        ) : (
                                            <Search className="absolute right-2.5 top-1.5 h-3.5 w-3.5 text-zinc-400" />
                                        )}
                                    </div>

                                    {showLaborResults && laborResults.length > 0 && mode !== 'view' && (
                                        <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white border-2 border-brand-primary/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {laborResults.map((res) => (
                                                <button
                                                    key={res.producto_sku}
                                                    type="button"
                                                    onClick={() => selectLabor(res)}
                                                    className="w-full p-2.5 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex flex-col gap-0.5 transition-colors"
                                                >
                                                    <span className="text-xs font-bold text-brand-primary leading-tight">{res.producto_descripcion}</span>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">SKU: {res.producto_sku}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-20">Versión</label>
                                <div className="flex-1 px-2 py-0.5 bg-brand-primary/10 rounded-lg text-brand-primary font-bold text-[10px]">
                                    V{formData.version || 1}
                                </div>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="divide-y-2 divide-brand-primary/5">
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-28">Herramientas</label>
                                <input
                                    name="herramientas"
                                    readOnly={mode === 'view'}
                                    value={formData.herramientas || ''}
                                    onChange={handleInputChange}
                                    className={`flex-1 bg-zinc-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                    placeholder="Separar por comas..."
                                />
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-28">Insumos</label>
                                <input
                                    name="insumos"
                                    readOnly={mode === 'view'}
                                    value={formData.insumos || ''}
                                    onChange={handleInputChange}
                                    className={`flex-1 bg-zinc-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                    placeholder="..."
                                />
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 relative">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-28">EPPS</label>
                                <div className="flex-1 relative" ref={eppRef}>
                                    <button
                                        type="button"
                                        onClick={() => mode !== 'view' && setShowEppDropdown(!showEppDropdown)}
                                        className={`w-full bg-zinc-50 border-none rounded-lg p-1.5 text-left flex flex-wrap gap-1 min-h-[32px] items-center ${mode === 'view' ? 'bg-transparent cursor-default' : 'hover:bg-zinc-100'}`}
                                    >
                                        {selectedEpps.length === 0 ? (
                                            <span className="text-zinc-400 text-[11px]">Seleccionar EPPS...</span>
                                        ) : (
                                            selectedEpps.map(epp => (
                                                <span key={epp} className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                    {epp}
                                                    {mode !== 'view' && (
                                                        <X
                                                            className="h-2 w-2 cursor-pointer hover:text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleEpp(epp)
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            ))
                                        )}
                                    </button>

                                    {showEppDropdown && mode !== 'view' && (
                                        <div className="absolute z-[120] top-full left-0 right-0 mt-1 bg-white border-2 border-brand-primary/10 rounded-xl shadow-2xl p-1.5 max-h-48 overflow-y-auto transform origin-top transition-all">
                                            {EPP_OPTIONS.map(epp => (
                                                <button
                                                    key={epp}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleEpp(epp)
                                                    }}
                                                    className={`w-full p-2 text-left text-[11px] rounded-lg transition-colors flex items-center justify-between mb-0.5 last:mb-0 ${selectedEpps.includes(epp) ? 'bg-brand-primary/5 text-brand-primary font-bold' : 'hover:bg-zinc-50 text-zinc-600'}`}
                                                >
                                                    {epp}
                                                    {selectedEpps.includes(epp) && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="divide-y-2 divide-brand-primary/5">
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-32">Fecha Elab.</label>
                                <input
                                    type="date"
                                    name="fecha_elaboracion"
                                    readOnly={mode === 'view'}
                                    value={formData.fecha_elaboracion || ''}
                                    onChange={handleInputChange}
                                    className={`flex-1 bg-zinc-50 border-none rounded-lg p-1.5 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                />
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 relative">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-32">ELABORÓ</label>
                                <div className="flex-1 relative" ref={elaboroRef}>
                                    <div className="relative">
                                        <input
                                            name="elaboro"
                                            readOnly={mode === 'view'}
                                            value={elaboroSearch}
                                            onChange={(e) => {
                                                setElaboroSearch(e.target.value)
                                                setFormData(prev => ({ ...prev, elaboro: e.target.value }))
                                                setShowElaboroResults(true)
                                            }}
                                            onFocus={() => setShowElaboroResults(true)}
                                            onClick={() => mode !== 'view' && setShowElaboroResults(true)}
                                            className={`w-full bg-zinc-50 border-none rounded-lg p-1.5 pl-8 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                            placeholder="Cargar personal..."
                                        />
                                        {isSearchingElaboro ? (
                                            <Loader2 className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                                        ) : (
                                            <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                                        )}
                                    </div>

                                    {showElaboroResults && mode !== 'view' && (
                                        <div className="absolute z-[200] top-full left-0 right-0 mt-1 bg-white border-2 border-brand-primary/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {isSearchingElaboro ? (
                                                <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                                                </div>
                                            ) : elaboroError ? (
                                                <div className="p-4 text-center text-xs text-red-500 bg-red-50">Error: {elaboroError}</div>
                                            ) : elaboroResults.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-zinc-400">No se encontraron resultados</div>
                                            ) : (
                                                elaboroResults.map((emp) => (
                                                    <button
                                                        key={emp.id}
                                                        type="button"
                                                        onClick={() => selectElaboro(emp)}
                                                        className="w-full p-2 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex flex-col gap-0.5 transition-colors"
                                                    >
                                                        <span className="text-xs font-bold text-brand-primary leading-tight">{emp.nombreCompleto}</span>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{emp.cargo || 'Sin cargo'}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-2.5 flex flex-col sm:flex-row sm:items-center gap-2 relative">
                                <label className="text-[10px] font-bold text-brand-primary uppercase w-32">APROBÓ</label>
                                <div className="flex-1 relative" ref={modificoRef}>
                                    <div className="relative">
                                        <input
                                            name="modifico"
                                            readOnly={mode === 'view'}
                                            value={modificoSearch}
                                            onChange={(e) => {
                                                setModificoSearch(e.target.value)
                                                setFormData(prev => ({ ...prev, modifico: e.target.value }))
                                                setShowModificoResults(true)
                                            }}
                                            onFocus={() => setShowModificoResults(true)}
                                            onClick={() => mode !== 'view' && setShowModificoResults(true)}
                                            className={`w-full bg-zinc-50 border-none rounded-lg p-1.5 pl-8 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium text-xs ${mode === 'view' ? 'bg-transparent cursor-default' : ''}`}
                                            placeholder="Cargar personal..."
                                        />
                                        {isSearchingModifico ? (
                                            <Loader2 className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400 animate-spin" />
                                        ) : (
                                            <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                                        )}
                                    </div>

                                    {showModificoResults && mode !== 'view' && (
                                        <div className="absolute z-[200] top-full left-0 right-0 mt-1 bg-white border-2 border-brand-primary/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {isSearchingModifico ? (
                                                <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                                                </div>
                                            ) : modificoError ? (
                                                <div className="p-4 text-center text-xs text-red-500 bg-red-50">Error: {modificoError}</div>
                                            ) : modificoResults.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-zinc-400">No se encontraron resultados</div>
                                            ) : (
                                                modificoResults.map((emp) => (
                                                    <button
                                                        key={emp.id}
                                                        type="button"
                                                        onClick={() => selectModifico(emp)}
                                                        className="w-full p-2 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex flex-col gap-0.5 transition-colors"
                                                    >
                                                        <span className="text-xs font-bold text-brand-primary leading-tight">{emp.nombreCompleto}</span>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase">{emp.cargo || 'Sin cargo'}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Table - Enhanced Border */}
                <div className="bg-white border-2 border-brand-primary/20 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-4 bg-zinc-50 divide-x-2 divide-brand-primary/20 border-b-2 border-brand-primary/20">
                        <div className="p-4 text-center font-bold text-brand-primary uppercase text-xs tracking-widest">Acción Importante</div>
                        <div className="p-4 text-center font-bold text-brand-primary uppercase text-xs tracking-widest">Paso Importante</div>
                        <div className="p-4 text-center font-bold text-brand-primary uppercase text-xs tracking-widest">Punto Clave</div>
                        <div className="p-4 text-center font-bold text-brand-primary uppercase text-xs tracking-widest">Razón Punto Clave</div>
                    </div>

                    <div className="divide-y-2 divide-brand-primary/10">
                        {steps.map((step, index) => (
                            <div key={index} className="grid grid-cols-4 relative group divide-x-2 divide-brand-primary/5">
                                <NumberedTextarea
                                    name="acciones_importantes"
                                    readOnly={mode === 'view'}
                                    value={step.acciones_importantes || ''}
                                    onStepChange={handleStepChange}
                                    index={index}
                                    placeholder="Acciones..."
                                />
                                <NumberedTextarea
                                    name="paso_importante"
                                    readOnly={mode === 'view'}
                                    value={step.paso_importante || ''}
                                    onStepChange={handleStepChange}
                                    index={index}
                                    placeholder="Procedimiento..."
                                />
                                <NumberedTextarea
                                    name="punto_clave"
                                    readOnly={mode === 'view'}
                                    value={step.punto_clave || ''}
                                    onStepChange={handleStepChange}
                                    index={index}
                                    placeholder="Puntos críticos..."
                                />
                                <div className="relative">
                                    <NumberedTextarea
                                        name="razon_punto_clave"
                                        readOnly={mode === 'view'}
                                        value={step.razon_punto_clave || ''}
                                        onStepChange={handleStepChange}
                                        index={index}
                                        placeholder="Explicación..."
                                    />
                                    {steps.length > 1 && mode !== 'view' && (
                                        <button
                                            type="button"
                                            onClick={() => removeStep(index)}
                                            className="absolute bottom-1 right-1 p-1.5 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {mode !== 'view' && (
                        <div className="p-4 bg-zinc-50 flex justify-center border-t-2 border-brand-primary/10">
                            <button
                                type="button"
                                onClick={addStep}
                                className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                            >
                                <Plus className="h-5 w-5" />
                                Agregar Paso
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Section (Two large boxes) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <div className="bg-white border-2 border-brand-primary/20 rounded-3xl overflow-hidden space-y-0 shadow-sm">
                        <label className="text-lg font-bold text-brand-primary uppercase tracking-tight block text-center border-b-2 border-brand-primary/10 py-2 bg-zinc-50/50">
                            Prohibido y porque
                        </label>
                        <NumberedTextarea
                            name="prohibido_y_porque"
                            readOnly={mode === 'view'}
                            value={formData.prohibido_y_porque || ''}
                            onChange={handleInputChange}
                            minHeight="min-h-[160px]"
                            placeholder="..."
                        />
                    </div>
                    <div className="bg-white border-2 border-brand-primary/20 rounded-3xl overflow-hidden space-y-0 shadow-sm">
                        <label className="text-lg font-bold text-brand-primary uppercase tracking-tight block text-center border-b-2 border-brand-primary/10 py-2 bg-zinc-50/50">
                            Tratamiento anomalías
                        </label>
                        <NumberedTextarea
                            name="tratamiento_anomalias"
                            readOnly={mode === 'view'}
                            value={formData.tratamiento_anomalias || ''}
                            onChange={handleInputChange}
                            minHeight="min-h-[160px]"
                            placeholder="..."
                        />
                    </div>
                </div>

                {/* Floating Actions */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                    <div className="bg-white/80 backdrop-blur-xl border-2 border-brand-primary/10 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            {mode === 'view' ? 'Volver' : 'Cancelar'}
                        </button>

                        <div className="flex-1 flex justify-center">
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-xl animate-bounce">
                                    <AlertCircle className="h-5 w-5" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl animate-pulse">
                                    <CheckCircle2 className="h-5 w-5" />
                                    ¡Guardado con éxito!
                                </div>
                            )}
                        </div>

                        {mode !== 'view' && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-10 py-3 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-secondary transition-all shadow-lg hover:shadow-brand-primary/30 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                {mode === 'create' ? 'Crear HDT' : 'Guardar Cambios'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
