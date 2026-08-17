'use client'
import React from 'react'
import type { Incident, SessionNote } from '@/types'
import { uid, fmtDate, toLocalInput } from '@/utils'

type Props = {
  value: Incident
  onChange: (v: Incident) => void
  onSave: () => void
  onCancel: () => void
}

type Errors = { title?: string, amount?: string }

function validate(v: Incident): Errors {
  const e: Errors = {}
  if (!v.title.trim()) e.title = 'El título es obligatorio.'
  if (v.isFinancial && (v.amount == null || Number.isNaN(v.amount) || v.amount <= 0)) {
    e.amount = 'Indica un monto mayor a 0.'
  }
  return e
}

export default function IncidentForm({ value, onChange, onSave, onCancel }: Props) {
  const [sessionText, setSessionText] = React.useState('')
  const [showErrors, setShowErrors] = React.useState(false)

  const errors = validate(value)
  const hasErrors = Object.keys(errors).length > 0

  const handleSave = () => {
    if (hasErrors) { setShowErrors(true); return }
    onSave()
  }

  const addSession = () => {
    const note: SessionNote = { id: uid('s_'), date: new Date().toISOString(), notes: sessionText.trim() }
    if (!note.notes) return
    onChange({ ...value, sessions: [note, ...value.sessions] })
    setSessionText('')
  }

  const removeSession = (id: string) => {
    onChange({ ...value, sessions: value.sessions.filter(s => s.id !== id) })
  }

  const errBorder = (bad?: string) => (showErrors && bad ? '!border-red-400 focus:!ring-red-100' : '')

  return (
    <div className="space-y-5">
      {/* Datos generales */}
      <section className="card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Datos generales</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="label">Título <span className="text-red-500">*</span></label>
            <input value={value.title} onChange={e=>onChange({...value, title:e.target.value})} className={`field ${errBorder(errors.title)}`} placeholder="Breve resumen del incidente"/>
            {showErrors && errors.title && <p className="text-xs font-medium text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="label">Reportado el</label>
            <input type="datetime-local" value={toLocalInput(value.reportedAt)} onChange={e=>onChange({...value, reportedAt: e.target.value ? new Date(e.target.value).toISOString() : value.reportedAt})} className="field"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Registrado en SCALA</label>
            <input type="datetime-local" value={toLocalInput(value.scalaAt)} onChange={e=>onChange({...value, scalaAt: e.target.value ? new Date(e.target.value).toISOString() : undefined})} className="field"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Estatus</label>
            <select value={value.status} onChange={e=>onChange({...value, status:e.target.value as Incident['status']})} className="field">
              <option value="open">Abierto</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="label">Descripción</label>
            <textarea value={value.description} onChange={e=>onChange({...value, description:e.target.value})} className="field min-h-[90px]" placeholder="¿Qué pasó?"/>
          </div>
        </div>
      </section>

      {/* Involucrados */}
      <section className="card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Involucrados</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="label">Corresponsal</label>
            <input value={value.correspondent} onChange={e=>onChange({...value, correspondent:e.target.value})} className="field"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Área</label>
            <input value={value.area} onChange={e=>onChange({...value, area:e.target.value})} className="field"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Acompañó (Control)</label>
            <input value={value.controlCompanion} onChange={e=>onChange({...value, controlCompanion:e.target.value})} className="field"/>
          </div>
        </div>
      </section>

      {/* Clasificación financiera */}
      <section className="card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Clasificación</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="label">¿Es financiero?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={()=>onChange({...value, isFinancial:true})}
                className={`chip ${value.isFinancial ? 'chip-on' : 'chip-off'}`}
              >Sí</button>
              <button
                type="button"
                onClick={()=>onChange({...value, isFinancial:false, amount: undefined})}
                className={`chip ${!value.isFinancial ? 'chip-on' : 'chip-off'}`}
              >No</button>
            </div>
          </div>

          {value.isFinancial && (
            <div className="space-y-1.5">
              <label className="label">Monto <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={value.amount ?? ''}
                    onChange={e=>onChange({...value, amount: e.target.value === '' ? undefined : Number(e.target.value)})}
                    className={`field pl-7 ${errBorder(errors.amount)}`}
                    placeholder="0.00"
                  />
                </div>
                <select
                  value={value.currency ?? 'MXN'}
                  onChange={e=>onChange({...value, currency: e.target.value})}
                  className="field w-28"
                >
                  <option value="MXN">MXN</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              {showErrors && errors.amount && <p className="text-xs font-medium text-red-500">{errors.amount}</p>}
            </div>
          )}

          <div className="space-y-1.5 md:col-span-2">
            <label className="label">Causa raíz</label>
            <input value={value.rootCause} onChange={e=>onChange({...value, rootCause:e.target.value})} className="field"/>
          </div>
        </div>
      </section>

      {/* Seguimiento */}
      <section className="card p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Seguimiento</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="label">Nota / ¿qué falta?</label>
            <input value={value.followUpNote ?? ''} onChange={e=>onChange({...value, followUpNote:e.target.value})} className="field"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Próxima sesión</label>
            <input type="datetime-local" value={toLocalInput(value.nextSessionAt)} onChange={e=>onChange({...value, nextSessionAt: e.target.value ? new Date(e.target.value).toISOString(): undefined})} className={`field ${value.nextSessionAt && value.status !== 'completed' ? '!border-amber-400 focus:!ring-amber-100' : ''}`}/>
            {value.nextSessionAt && value.status !== 'completed' && (
              <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                📅 Quedó agendada una próxima sesión: este incidente se marcará como «falta seguimiento».
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Sesiones</h4>
            <span className="text-xs text-neutral-500">Total: {value.sessions.length}</span>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Notas de la sesión…"
              value={sessionText}
              onChange={e=>setSessionText(e.target.value)}
              onKeyDown={e=>{ if (e.key === 'Enter') { e.preventDefault(); addSession() } }}
              className="field flex-1"
            />
            <button type="button" onClick={addSession} className="btn-primary">Agregar</button>
          </div>
          <ul className="space-y-2">
            {value.sessions.map(s => (
              <li key={s.id} className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-neutral-500">{fmtDate(s.date)}</div>
                  <button type="button" onClick={()=>removeSession(s.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">{s.notes}</div>
              </li>
            ))}
            {value.sessions.length === 0 && (
              <li className="rounded-xl border border-dashed border-neutral-200 p-3 text-center text-sm text-neutral-400 dark:border-neutral-700">
                Aún no hay sesiones registradas.
              </li>
            )}
          </ul>
        </div>
      </section>

      {showErrors && hasErrors && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          Revisa los campos marcados antes de guardar.
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={handleSave} className="btn-primary">Guardar incidente</button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancelar</button>
      </div>
    </div>
  )
}
