import { createClient } from '@supabase/supabase-js'

// Traemos las llaves secretas de tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creamos y exportamos la conexión
export const supabase = createClient(supabaseUrl, supabaseAnonKey)