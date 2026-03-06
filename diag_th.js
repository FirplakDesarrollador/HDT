/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const https = require('https');

async function runDiag() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_TH_SUPABASE_URL=(.*)/);
        const keyMatch = env.match(/NEXT_PUBLIC_TH_SUPABASE_ANON_KEY=(.*)/);

        const url = urlMatch[1].trim();
        const key = keyMatch[1].trim();

        const fetchRPC = (name, body = {}) => new Promise((resolve, reject) => {
            const fullUrl = `${url}/rest/v1/rpc/${name}`;
            const postData = JSON.stringify(body);
            const req = https.request(fullUrl, {
                method: 'POST',
                headers: {
                    'apikey': key,
                    'Authorization': 'Bearer ' + key,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                let data = '';
                res.on('data', (d) => data += d);
                res.on('end', () => resolve({ status: res.statusCode, data }));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('--- Checking TH schemas ---');
        // This is a guess that there might be a function to list schemas, 
        // but it's unlikely to be public.

        // Instead, let's try to query 'empleados' in common schemas again, 
        // but this time we check for 200 vs 404 vs 406.
        const schemas = ['public', 'th', 'rh', 'PROD', 'conectados'];
        for (const s of schemas) {
            const fullUrl = `${url}/rest/v1/empleados?select=count`;
            await new Promise((resolve) => {
                https.get(fullUrl, {
                    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Accept-Profile': s, 'Prefer': 'count=exact' }
                }, (res) => {
                    console.log(`Schema: ${s}, Status: ${res.statusCode}, Range: ${res.headers['content-range']}`);
                    resolve();
                });
            });
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

runDiag();
