import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggntuptvqxditgxtnsex.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTAxMTYsImV4cCI6MjA3NDU4NjExNn0.pVVcvkFYRWb8STJB5OV-EQKSiPqSVO0gjfcbnCcTrt8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
