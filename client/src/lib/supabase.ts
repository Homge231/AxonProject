import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zowxktrpfqwpzckpnytu.supabase.co'
const supabaseAnonKey = 'YOUR_ACTUAL_ANON_KEY_HERE' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)