import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Incident Manager (IndexedDB)',
  description: 'Local incident tracking with IndexedDB (Dexie)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  )
}
