export type SessionNote = {
  id: string;
  date: string; // ISO
  notes: string;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  reportedAt: string; // ISO date when reported
  correspondent: string; // corresponsal
  area: string; // área
  controlCompanion: string; // quien de control me acompañó
  isFinancial: boolean; // financiero o no financiero
  rootCause: string;
  status: 'open' | 'in_progress' | 'completed';
  followUpNote?: string; // qué me falta
  nextSessionAt?: string; // ISO
  sessions: SessionNote[];
  createdAt: string;
  updatedAt: string;
};
