import type { Incident } from '@/types'

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// Fecha + hora legible en español, ej. "21 jul 2026, 14:30"
export function fmtDate(input?: string) {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return input
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Solo fecha, ej. "21 jul 2026"
export function fmtDateShort(input?: string) {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return input
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Monto formateado como moneda, ej. "$1,250.00"
export function fmtMoney(amount?: number, currency = 'MXN') {
  if (amount == null || Number.isNaN(amount)) return ''
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toLocaleString('es-MX')} ${currency}`
  }
}

// Convierte un ISO a valor válido para <input type="datetime-local"> respetando la hora local
export function toLocalInput(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

// ¿La próxima sesión ya venció y el incidente sigue sin completarse?
export function isOverdue(inc: Incident) {
  if (!inc.nextSessionAt || inc.status === 'completed') return false
  const next = new Date(inc.nextSessionAt).getTime()
  if (Number.isNaN(next)) return false
  return next < Date.now()
}

// Tiene una próxima sesión agendada a futuro y aún no está completado -> "falta algo"
export function hasPendingFollowUp(inc: Incident) {
  if (!inc.nextSessionAt || inc.status === 'completed') return false
  return !isOverdue(inc)
}

// --- Trimestres (proceso trimestral) ---
export function getQuarter(iso: string) {
  const d = new Date(iso)
  const q = Math.floor(d.getMonth() / 3) + 1
  return { year: d.getFullYear(), q }
}

export function periodKey(iso: string) {
  const { year, q } = getQuarter(iso)
  return `${year}-Q${q}`
}

const quarterMonths: Record<string, string> = {
  '1': 'Ene–Mar', '2': 'Abr–Jun', '3': 'Jul–Sep', '4': 'Oct–Dic',
}

export function periodLabel(key: string) {
  const [year, q] = key.split('-Q')
  return `${year} · T${q} (${quarterMonths[q] ?? ''})`
}

export function currentPeriodKey() {
  const d = new Date()
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`
}

// Escapa un valor para CSV (comillas y separadores)
function csvCell(v: unknown) {
  const s = v == null ? '' : String(v)
  if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

// Genera un CSV (compatible con Excel) a partir de los incidentes
export function incidentsToCSV(items: Incident[]) {
  const headers = [
    'Título', 'Estatus', 'Reportado', 'Registrado en SCALA', 'Corresponsal', 'Área', 'Acompañó (Control)',
    'Financiero', 'Monto', 'Moneda', 'Causa raíz', 'Nota / falta', 'Próxima sesión', 'Sesiones',
  ]
  const rows = items.map(i => [
    i.title,
    i.status === 'completed' ? 'Completado' : i.status === 'in_progress' ? 'En progreso' : 'Abierto',
    fmtDate(i.reportedAt),
    i.scalaAt ? fmtDate(i.scalaAt) : '',
    i.correspondent,
    i.area,
    i.controlCompanion,
    i.isFinancial ? 'Sí' : 'No',
    i.isFinancial && i.amount != null ? i.amount : '',
    i.isFinancial ? (i.currency ?? 'MXN') : '',
    i.rootCause,
    i.followUpNote ?? '',
    i.nextSessionAt ? fmtDate(i.nextSessionAt) : '',
    i.sessions.length,
  ])
  const lines = [headers, ...rows].map(r => r.map(csvCell).join(','))
  // BOM para que Excel reconozca UTF-8 (acentos)
  return '﻿' + lines.join('\r\n')
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function todayStamp() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}
