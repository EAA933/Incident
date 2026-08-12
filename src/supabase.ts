import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Se avisa en consola si faltan las variables (útil al desplegar en Vercel)
if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const isSupabaseConfigured = Boolean(url && anonKey)

// Valores de reserva para que la app no se caiga si aún no hay variables.
// Con estos valores el login simplemente no funcionará hasta configurar Supabase.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'incident-auth',
    },
  },
)
