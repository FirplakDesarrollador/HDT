/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mainKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(mainUrl, mainKey);

async function inspectHdts() {
    console.log('--- Inspecting HDTs ---');

    const { data, error } = await supabase
        .from('hdts')
        .select('*')
        .limit(3);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    data.forEach((hdt, index) => {
        console.log(`\nRECORD #${index + 1} (ID: ${hdt.id})`);
        Object.keys(hdt).forEach(key => {
            let val = hdt[key];
            if (typeof val === 'string' && val.length > 50) val = val.substring(0, 50) + '...';
            console.log(`  ${key}: ${val}`);
        });
    });
}

inspectHdts();
