/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(mainUrl, mainKey);

async function listHdts() {
    console.log('--- Current HDTs in DB ---');

    const { data, error } = await supabase
        .from('hdts')
        .select('id, codigo, planta, labor');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} records:`);
    data.forEach(hdt => {
        console.log(`- PROCESO/LABOR: ${hdt.labor || hdt.proceso}`);
        console.log(`  Planta: '${hdt.planta}'`);
        console.log(`  Codigo: ${hdt.codigo}`);
    });
}

listHdts();
