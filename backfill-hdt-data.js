/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(mainUrl, mainKey);

const HDT_ID = 'a93456bb-9daf-4dbe-a2d0-5362cced08a7';

async function updateHdtData() {
    console.log(`Updating HDT: ${HDT_ID}`);

    const updates = {
        herramientas: 'Espatula sin filo, trapos, ...',
        insumos: 'Cera, gelcoat, ...',
        epp: 'Gafas de seguridad, guantes de nitrilo, mascarilla desechable',
        prohibido_y_porque: '1. No usar herramientas con filo\n2. No golpear el molde',
        tratamiento_anomalias: '1. Reportar daño a calidad\n2. Detener producción'
    };

    const { error } = await supabase
        .from('hdts')
        .update(updates)
        .eq('id', HDT_ID);

    if (error) {
        console.error('Error updating HDT:', error);
    } else {
        console.log('Success: HDT updated with sample data.');
    }
}

updateHdtData();
