'use client'
import React from 'react'
import type { Incident, SessionNote } from '@/types'
import { uid } from '@/utils'
import { fmtDate } from '@/utils'

type Props = {
  value: Incident
  onChange: (v: Incident) => void
  onSave: () => void
  onCancel: () => void
}

export default function IncidentForm({ value, onChange, onSave, onCancel }: Props) {
  const [sessionText, setSessionText] = React.useState('')

  const addSession = () => {
    const note: SessionNote = { id: uid('s_'), date: new Date().toISOString(), notes: sessionText.trim() }
    if (!note.notes) return
    onChange({ ...value, sessions: [note, ...value.sessions] })
    setSessionText('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm">Título</label>
          <input value={value.title} onChange={e=>onChange({...value, title:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Reportado en</label>
          <input type="datetime-local" value={value.reportedAt?.slice(0,16)} onChange={e=>onChange({...value, reportedAt:new Date(e.target.value).toISOString()})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm">Descripción</label>
          <textarea value={value.description} onChange={e=>onChange({...value, description:e.target.value})} className="w-full border rounded-xl px-3 py-2 min-h-[80px]"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Corresponsal</label>
          <input value={value.correspondent} onChange={e=>onChange({...value, correspondent:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Área</label>
          <input value={value.area} onChange={e=>onChange({...value, area:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Acompañó (Control)</label>
          <input value={value.controlCompanion} onChange={e=>onChange({...value, controlCompanion:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">¿Financiero?</label>
          <select value={value.isFinancial ? '1' : '0'} onChange={e=>onChange({...value, isFinancial:e.target.value==='1'})} className="w-full border rounded-xl px-3 py-2">
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Causa raíz</label>
          <input value={value.rootCause} onChange={e=>onChange({...value, rootCause:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Estatus</label>
          <select value={value.status} onChange={e=>onChange({...value, status:e.target.value as Incident['status']})} className="w-full border rounded-xl px-3 py-2">
            <option value="open">Abierto</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Nota / ¿qué falta?</label>
          <input value={value.followUpNote ?? ''} onChange={e=>onChange({...value, followUpNote:e.target.value})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
        <div className="space-y-1">
          <label className="text-sm">Próxima sesión</label>
          <input type="datetime-local" value={value.nextSessionAt ? value.nextSessionAt.slice(0,16): ''} onChange={e=>onChange({...value, nextSessionAt: e.target.value ? new Date(e.target.value).toISOString(): undefined})} className="w-full border rounded-xl px-3 py-2"/>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sesiones</h3>
          <span className="text-xs text-neutral-500">Total: {value.sessions.length}</span>
        </div>
        <div className="flex gap-2">
          <input placeholder="Notas de la sesión" value={sessionText} onChange={e=>setSessionText(e.target.value)} className="flex-1 border rounded-xl px-3 py-2"/>
          <button onClick={addSession} className="rounded-xl px-3 py-2 border">Agregar</button>
        </div>
        <ul className="space-y-2">
          {value.sessions.map(s => (
            <li key={s.id} className="p-3 border rounded-xl">
              <div className="text-xs text-neutral-500">{fmtDate(s.date)}</div>
              <div className="whitespace-pre-wrap">{s.notes}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button onClick={onSave} className="rounded-xl px-4 py-2 bg-black text-white">Guardar</button>
        <button onClick={onCancel} className="rounded-xl px-4 py-2 border">Cancelar</button>
      </div>
    </div>
  )
}
