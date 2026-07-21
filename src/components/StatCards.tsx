import type { Incident } from '@/types'
import { fmtMoney, isOverdue } from '@/utils'

export default function StatCards({ items }: { items: Incident[] }) {
  const total = items.length
  const open = items.filter(i => i.status !== 'completed').length
  const overdue = items.filter(isOverdue).length

  // Suma de montos financieros agrupados por moneda
  const byCurrency = new Map<string, number>()
  for (const i of items) {
    if (i.isFinancial && i.amount != null) {
      const cur = i.currency ?? 'MXN'
      byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + i.amount)
    }
  }
  const montoLabel = byCurrency.size === 0
    ? '—'
    : Array.from(byCurrency.entries()).map(([cur, amt]) => fmtMoney(amt, cur)).join(' · ')

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Incidentes" value={String(total)} icon="🗂️" tone="brand" />
      <Stat label="Abiertos" value={String(open)} icon="📂" tone="sky" />
      <Stat label="Monto financiero" value={montoLabel} icon="💰" tone="violet" small />
      <Stat label="Sesiones vencidas" value={String(overdue)} icon="⏰" tone={overdue > 0 ? 'red' : 'green'} />
    </div>
  )
}

const tones = {
  brand: 'from-brand-500/10 to-brand-500/0 text-brand-700 dark:text-brand-300',
  sky: 'from-sky-500/10 to-sky-500/0 text-sky-700 dark:text-sky-300',
  violet: 'from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 dark:text-fuchsia-300',
  red: 'from-red-500/10 to-red-500/0 text-red-700 dark:text-red-300',
  green: 'from-emerald-500/10 to-emerald-500/0 text-emerald-700 dark:text-emerald-300',
}

function Stat({ label, value, icon, tone, small }: { label: string, value: string, icon: string, tone: keyof typeof tones, small?: boolean }) {
  return (
    <div className={`card relative overflow-hidden bg-gradient-to-br p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{label}</div>
        <div className="text-lg">{icon}</div>
      </div>
      <div className={`mt-1 font-extrabold text-neutral-900 dark:text-neutral-100 ${small ? 'text-lg' : 'text-2xl'}`}>{value}</div>
    </div>
  )
}
