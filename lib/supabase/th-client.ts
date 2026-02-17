import { createClient } from '@supabase/supabase-js'

export function createTHClient() {
    const url = process.env.NEXT_PUBLIC_TH_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_TH_SUPABASE_ANON_KEY!

    if (!url || !key) {
        console.error('❌ Missing TH environment variables!')
    }

    // Use vanilla createClient to avoid SSR/Cookie conflicts with the main client only for public data fetching
    return createClient(url, key, {
        auth: {
            persistSession: false, // We only need public data, no session persistence needed for this secondary client
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    })
}
