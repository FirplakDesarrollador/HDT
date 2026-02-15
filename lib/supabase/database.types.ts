export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hdts: {
        Row: {
          id: string
          codigo: string
          proceso: string | null
          labor: string | null
          version: number | null
          fecha_elaboracion: string | null
          elaboro: string | null
          modifico: string | null
          herramientas: string | null
          insumos: string | null
          epp: string | null
          prohibido_y_porque: string | null
          tratamiento_anomalias: string | null
          is_current: boolean
          updated_at: string
          updated_by: string | null
          planta: string | null
        }
        Insert: {
          id?: string
          codigo: string
          proceso?: string | null
          labor?: string | null
          version?: number | null
          fecha_elaboracion?: string | null
          elaboro?: string | null
          modifico?: string | null
          herramientas?: string | null
          insumos?: string | null
          epp?: string | null
          prohibido_y_porque?: string | null
          tratamiento_anomalias?: string | null
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
          planta?: string | null
        }
        Update: {
          id?: string
          codigo?: string
          proceso?: string | null
          labor?: string | null
          version?: number | null
          fecha_elaboracion?: string | null
          elaboro?: string | null
          modifico?: string | null
          herramientas?: string | null
          insumos?: string | null
          epp?: string | null
          prohibido_y_porque?: string | null
          tratamiento_anomalias?: string | null
          is_current?: boolean
          updated_at?: string
          updated_by?: string | null
          planta?: string | null
        }
      }
      hdt_steps: {
        Row: {
          id: string
          hdt_id: string
          step_no: number | null
          acciones_importantes: string | null
          paso_importante: string | null
          punto_clave: string | null
          razon_punto_clave: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          hdt_id: string
          step_no?: number | null
          acciones_importantes?: string | null
          paso_importante?: string | null
          punto_clave?: string | null
          razon_punto_clave?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          hdt_id?: string
          step_no?: number | null
          acciones_importantes?: string | null
          paso_importante?: string | null
          punto_clave?: string | null
          razon_punto_clave?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
  }
}
