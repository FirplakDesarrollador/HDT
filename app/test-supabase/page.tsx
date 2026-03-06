'use client'

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

export default function TestSupabasePage() {
    const [status, setStatus] = useState<string>('Testing connection...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                const { data, error } = await supabase.from('hdts').select('*').limit(1);

                if (error) {
                    setStatus('Connection error: ' + error.message);
                    return;
                }

                setStatus('Connection successful!');
                setData(data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setStatus('Unexpected error: ' + (err.message || 'Unknown error'));
            }
        }
        testConnection();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            <p className={`mb-4 ${status.includes('error') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
            {data && (
                <div className="bg-zinc-100 p-4 rounded-xl">
                    <h2 className="font-bold mb-2">Data Sample:</h2>
                    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
