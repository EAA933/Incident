import { supabase } from '@/supabase'
import type { Incident } from '@/types'

// Los incidentes se guardan en la nube (Supabase) en la tabla `incidents`.
// Cada fila: { id, user_id, data (jsonb con el Incident completo), updated_at }.
// Row Level Security garantiza que cada usuario solo ve sus propios datos.

const TABLE = 'incidents'

async function currentUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function allIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: { data: Incident }) => row.data)
}

export async function upsertIncident(inc: Incident) {
  inc.updatedAt = new Date().toISOString()
  const user_id = await currentUserId()
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: inc.id, user_id, data: inc, updated_at: inc.updatedAt })
  if (error) throw error
  return inc
}

export async function deleteIncident(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function countIncidents() {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function clearIncidents() {
  const user_id = await currentUserId()
  if (!user_id) return
  const { error } = await supabase.from(TABLE).delete().eq('user_id', user_id)
  if (error) throw error
}

export async function bulkPutIncidents(items: Incident[]) {
  if (items.length === 0) return
  const user_id = await currentUserId()
  const rows = items.map(inc => ({
    id: inc.id,
    user_id,
    data: inc,
    updated_at: inc.updatedAt ?? new Date().toISOString(),
  }))
  const { error } = await supabase.from(TABLE).upsert(rows)
  if (error) throw error
}
