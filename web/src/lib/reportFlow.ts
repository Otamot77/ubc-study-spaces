export type ReportLevel = 'low' | 'moderate' | 'high'

/** Edit token lives in component state only, never in localStorage or a URL. */
export interface SavedReport {
  reportId: number
  editToken: string
  editableUntil: number
  level: ReportLevel | null
}

export function correctionAllowed(report: SavedReport, now = Date.now()): boolean {
  return now <= report.editableUntil
}

/** Tapping an already-saved choice toggles it off rather than posting another vote. */
export function nextReportLevel(saved: SavedReport | null, tapped: ReportLevel): ReportLevel | null {
  return saved?.level === tapped ? null : tapped
}

export function buildReportRequest(spaceId: string, level: ReportLevel | null, saved: SavedReport | null) {
  if (saved === null && level === null) throw new Error('Cannot undo an unsaved report')
  const endpoint = '/api/spaces/' + encodeURIComponent(spaceId) + '/reports'
  return saved
    ? {
        url: endpoint + '/' + saved.reportId,
        method: 'PATCH',
        body: JSON.stringify({ level, editToken: saved.editToken }),
      }
    : {
        url: endpoint,
        method: 'POST',
        body: JSON.stringify({ level }),
      }
}
