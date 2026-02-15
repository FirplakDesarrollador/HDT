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

    const uniquePlants = Array.from(new Set(data.map(item => item.planta)))
    console.log('Plantas encontradas:', uniquePlants)
}

checkPlants()
