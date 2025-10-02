import type { Incident } from '@/types'
import { fmtDate } from '@/utils'
import Badge from './Badge'

export default function IncidentCard({ inc, onEdit, onDelete }: { inc: Incident, onEdit: (i: Incident)=>void, onDelete: (id: string)=>void }) {
  const color = inc.status === 'completed' ? 'bg-emerald-50 border-emerald-200' :
                inc.status === 'in_progress' ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-semibold text-lg">{inc.title}</h3>
          <div className="text-xs text-neutral-500">Reportado: {fmtDate(inc.reportedAt)}</div>
        </div>
        <div className="flex gap-2">
          <Badge>{inc.status === 'completed' ? 'Completado' : inc.status === 'in_progress' ? 'En progreso' : 'Abierto'}</Badge>
          <Badge>{inc.isFinancial ? 'Financiero' : 'No financiero'}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-neutral-800">{inc.description}</p>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div><span className="text-neutral-500">Corresponsal:</span> {inc.correspondent || '-'}</div>
        <div><span className="text-neutral-500">Área:</span> {inc.area || '-'}</div>
        <div><span className="text-neutral-500">Acompañó:</span> {inc.controlCompanion || '-'}</div>
        <div><span className="text-neutral-500">Causa raíz:</span> {inc.rootCause || '-'}</div>
        <div><span className="text-neutral-500">Próx. sesión:</span> {inc.nextSessionAt ? fmtDate(inc.nextSessionAt) : '-'}</div>
        <div><span className="text-neutral-500">Sesiones:</span> {inc.sessions.length}</div>
        <div className="col-span-2"><span className="text-neutral-500">Nota:</span> {inc.followUpNote || '-'}</div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={()=>onEdit(inc)} className="rounded-xl px-3 py-2 border">Editar</button>
        <button onClick={()=>onDelete(inc.id)} className="rounded-xl px-3 py-2 border">Eliminar</button>
      </div>
    </div>
  )
}
