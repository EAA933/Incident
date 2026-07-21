type Tone = 'neutral' | 'blue' | 'amber' | 'green' | 'violet' | 'red'

const tones: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-brand-50 text-brand-700 border-brand-200',
  red: 'bg-red-50 text-red-700 border-red-200',
}

export default function Badge({ children, tone = 'neutral' }: { children: React.ReactNode, tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}
