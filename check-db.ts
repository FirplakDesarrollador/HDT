import { createClient } from './lib/supabase/browser-client'

async function checkPlants() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('hdts')
        .select('planta')

    if (error) {
        console.error('Error fetching plants:', error)
        return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniquePlants = Array.from(new Set((data as any[]).map(item => item.planta)))
    console.log('Plantas encontradas:', uniquePlants)
}

checkPlants()
