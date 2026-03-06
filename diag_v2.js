/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const https = require('https');

async function runDiag() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const fetch = (path) => new Promise((resolve, reject) => {
            https.get(`${url}/rest/v1/${path}`, {
                headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
            }, (res) => {
                let data = '';
                res.on('data', (d) => data += d);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });

        const hdts = await fetch('hdts?select=*');
        const steps = await fetch('hdt_steps?select=*');

        const output = `
HDTS:
${hdts}

STEPS:
${steps}
`;
        fs.writeFileSync('diag_output.txt', output);
        console.log('Diagnostic finished');
    } catch (e) {
        fs.writeFileSync('diag_output.txt', e.toString());
    }
}

runDiag();
