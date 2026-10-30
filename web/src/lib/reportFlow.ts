export type ReportLevel = 'low' | 'moderate' | 'high'

/** Edit token lives in component state only, never in localStorage or a URL. */
export interface SavedReport {
  reportId: number
  editToken: string
  editableUntil: number
  level: ReportLevel
}

export function correctionAllowed(report: SavedReport, now = Date.now()): boolean {
  return now <= report.editableUntil
}

export function buildReportRequest(spaceId: string, level: ReportLevel, saved: SavedReport | null) {
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
