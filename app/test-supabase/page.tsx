import { supabase } from '../../lib/supabase/client';

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('hdts').select('*').limit(1);

        if (error) {
            console.error('Connection error:', error.message);
            return;
        }

        console.log('Connection successful!');
        console.log('Data sample:', data);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
