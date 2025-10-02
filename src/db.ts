import Dexie, { type Table } from 'dexie'
import type { Incident } from '@/types'

class IncidentDB extends Dexie {
  incidents!: Table<Incident, string>

  constructor() {
    super('incidentManagerDB')
    this.version(1).stores({
      incidents: 'id, reportedAt, status, area, correspondent, isFinancial'
    })
  }
}

export const db = new IncidentDB()

export async function upsertIncident(inc: Incident) {
  inc.updatedAt = new Date().toISOString()
  await db.incidents.put(inc)
  return inc
}

export async function deleteIncident(id: string) {
  await db.incidents.delete(id)
}

export async function allIncidents() {
  return await db.incidents
    .orderBy('reportedAt')
    .reverse()
    .toArray()
}
