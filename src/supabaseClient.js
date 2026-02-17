import { createClient } from '@supabase/supabase-js';

// Vite requires environment variables to be prefixed with VITE_ to be accessible in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing in the frontend!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);