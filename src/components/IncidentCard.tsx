import type { Incident } from '@/types'
import { fmtDate, fmtMoney, isOverdue, hasPendingFollowUp } from '@/utils'
import Badge from './Badge'

const statusMeta = {
  open: { label: 'Abierto', tone: 'blue' as const, accent: 'before:bg-sky-400' },
  in_progress: { label: 'En progreso', tone: 'amber' as const, accent: 'before:bg-amber-400' },
  completed: { label: 'Completado', tone: 'green' as const, accent: 'before:bg-emerald-400' },
}

export default function IncidentCard({ inc, onEdit, onDelete, onDuplicate }: {
  inc: Incident,
  onEdit: (i: Incident)=>void,
  onDelete: (i: Incident)=>void,
  onDuplicate: (i: Incident)=>void,
}) {
  const s = statusMeta[inc.status]
  const overdue = isOverdue(inc)
  const pending = hasPendingFollowUp(inc)

  const ring = overdue
    ? 'ring-1 ring-red-200 dark:ring-red-900/50'
    : pending
      ? 'ring-1 ring-amber-300 dark:ring-amber-800/60'
      : ''
  const accent = overdue ? 'before:bg-red-500' : pending ? 'before:bg-amber-400' : s.accent

  return (
    <div className={`card relative overflow-hidden p-5 transition hover:shadow-pop
                     before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 ${accent} ${ring}`}>
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-neutral-900 dark:text-neutral-100">{inc.title || 'Sin título'}</h3>
          <div className="mt-0.5 text-xs text-neutral-500">Reportado: {fmtDate(inc.reportedAt)}</div>
          {inc.scalaAt && <div className="text-xs text-neutral-500">Registrado en SCALA: {fmtDate(inc.scalaAt)}</div>}
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {overdue && <Badge tone="red">⏰ Vencido</Badge>}
          {pending && <Badge tone="amber">📅 Falta seguimiento</Badge>}
          <Badge tone={s.tone}>{s.label}</Badge>
          <Badge tone={inc.isFinancial ? 'violet' : 'neutral'}>
            {inc.isFinancial ? 'Financiero' : 'No financiero'}
          </Badge>
        </div>
      </div>

      {inc.isFinancial && inc.amount != null && (
        <div className="mt-3 ml-2 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-1.5 dark:bg-brand-900/30">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">Monto</span>
          <span className="text-lg font-bold text-brand-700 dark:text-brand-200">{fmtMoney(inc.amount, inc.currency)}</span>
        </div>
      )}

      {inc.description && (
        <p className="mt-3 ml-2 line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">{inc.description}</p>
      )}

      <div className="mt-4 ml-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
        <Field label="Corresponsal" value={inc.correspondent} />
        <Field label="Área" value={inc.area} />
        <Field label="Acompañó" value={inc.controlCompanion} />
        <Field label="Causa raíz" value={inc.rootCause} />
        <Field label="Próx. sesión" value={inc.nextSessionAt ? fmtDate(inc.nextSessionAt) : ''} tone={overdue ? 'red' : pending ? 'amber' : undefined} />
        <Field label="Sesiones" value={String(inc.sessions.length)} />
      </div>

      {inc.followUpNote && (
        <div className="mt-3 ml-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <span className="font-semibold">Pendiente: </span>{inc.followUpNote}
        </div>
      )}

      <div className="mt-4 ml-2 flex flex-wrap gap-2">
        <button onClick={()=>onEdit(inc)} className="btn-ghost !py-2">Editar</button>
        <button onClick={()=>onDuplicate(inc)} className="btn-ghost !py-2">Duplicar</button>
        <button onClick={()=>onDelete(inc)} className="btn-danger !py-2">Eliminar</button>
      </div>
    </div>
  )
}

function Field({ label, value, tone }: { label: string, value?: string, tone?: 'red' | 'amber' }) {
  const cls = tone === 'red'
    ? 'font-semibold text-red-600 dark:text-red-400'
    : tone === 'amber'
      ? 'font-semibold text-amber-600 dark:text-amber-400'
      : 'text-neutral-800 dark:text-neutral-200'
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className={`truncate ${cls}`}>{value || '—'}</div>
    </div>
  )
}
