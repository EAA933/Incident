import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Se avisa en consola si faltan las variables (útil al desplegar en Vercel)
if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const isSupabaseConfigured = Boolean(url && anonKey)

// En el navegador enrutamos por el "puente" del mismo dominio (/sb), que Vercel
// reenvía a Supabase. Así evitamos bloqueos corporativos a *.supabase.co.
// En el servidor usamos la URL real directamente.
const clientUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/sb`
  : (url || 'https://placeholder.supabase.co')

export const supabase = createClient(
  clientUrl,
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'incident-auth',
    },
  },
)
