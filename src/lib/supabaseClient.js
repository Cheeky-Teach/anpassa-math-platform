import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env to access .env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance of the Supabase client to use across your app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);