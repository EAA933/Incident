/** @type {import('next').NextConfig} */

// Dominio real de Supabase (desde la variable de entorno).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

const nextConfig = {
  experimental: { typedRoutes: true },
  // "Puente": el navegador llama a /sb/* en tu propio dominio y Vercel lo reenvía
  // a Supabase del lado servidor. Así, redes que bloquean *.supabase.co igual funcionan.
  async rewrites() {
    if (!SUPABASE_URL) return []
    return [
      { source: '/sb/:path*', destination: `${SUPABASE_URL}/:path*` },
    ]
  },
}
export default nextConfig
