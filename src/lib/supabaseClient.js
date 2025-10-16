import { createClient } from '@supabase/supabase-js'

// These must be set by you in `.env` or replaced here for local testing
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
