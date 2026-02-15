const fs = require('fs');
const https = require('https');

try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

    if (!urlMatch || !keyMatch) {
        console.error('Missing env vars');
        process.exit(1);
    }

    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();

    // Check tables and permissions
    const tables = ['hdts', 'hdt_steps'];

    tables.forEach(table => {
        const apiUrl = `${url}/rest/v1/${table}?select=count`;
        const options = {
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Prefer': 'count=exact'
            }
        };

        https.get(apiUrl, options, (res) => {
            console.log(`Table: ${table}, Status: ${res.statusCode}, Range: ${res.headers['content-range']}`);
        });
    });

    // Check specific HDT
    const searchUrl = `${url}/rest/v1/hdts?select=*`;
    const options = {
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key
        }
    };

    https.get(searchUrl, options, (res) => {
        let data = '';
        res.on('data', (d) => data += d);
        res.on('end', () => {
            console.log('ALL_HDTS:');
            console.log(data);
        });
    });

} catch (e) {
    console.error(e);
}
