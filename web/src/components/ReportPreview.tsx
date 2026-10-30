import { CheckCircle2, Info, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ReportLocationPicker } from './ReportLocationPicker'
import { buildReportRequest, correctionAllowed, nextReportLevel } from '../lib/reportFlow'
import type { ReportLevel, SavedReport } from '../lib/reportFlow'
import type { StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  onSelect: (id: string) => void
  onSuccess: () => void
  requiresBetaCode: boolean
  betaAccessCode: string
  onBetaAccessCodeChange: (value: string) => void
}

const options: { id: ReportLevel; label: string; detail: string }[] = [
  { id: 'low', label: 'Plenty of seats', detail: 'Lots of places to sit' },
  { id: 'moderate', label: 'Some seats', detail: 'Some spots are open' },
  { id: 'high', label: 'Almost full', detail: 'Very limited seating' },
]

export function ReportPreview({
  spaces, selected, onSelect, onSuccess, requiresBetaCode, betaAccessCode, onBetaAccessCodeChange,
}: Props) {
  const [pendingLevel, setPendingLevel] = useState<ReportLevel | null>(null)
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [correctionExpired, setCorrectionExpired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestInFlight = useRef(false)

  // Changing buildings starts a new report; prior edit tokens never transfer.
  useEffect(() => {
    setPendingLevel(null)
    setSavedReport(null)
    setCorrectionExpired(false)
    setError(null)
  }, [selected.id])

  async function submit(level: ReportLevel) {
    if (requestInFlight.current || correctionExpired) return
    if (requiresBetaCode && betaAccessCode.trim().length === 0) {
      setError('Enter your beta access code before submitting a report.')
      return
    }
    if (savedReport && !correctionAllowed(savedReport)) {
      setCorrectionExpired(true)
      setError('This report can no longer be changed. Close and reopen Report to submit a new observation later.')
      return
    }

    const nextLevel = nextReportLevel(savedReport, level)
    requestInFlight.current = true
    setPendingLevel(level)
    setSubmitting(true)
    setError(null)
    try {
      const request = buildReportRequest(selected.id, nextLevel, savedReport)
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...(requiresBetaCode ? { 'X-Study-Spaces-Access': betaAccessCode } : {}),
        },
        body: request.body,
      })
      const data = await response.json().catch(() => null) as {
        error?: string
        reportId?: number
        editToken?: string
        editableUntil?: string
      } | null
      if (!response.ok) {
        if (savedReport && response.status === 409) setCorrectionExpired(true)
        throw new Error(data?.error || 'Could not save your report. Please try again.')
      }

      if (savedReport) {
        setSavedReport({ ...savedReport, level: nextLevel })
      } else if (data && typeof data.reportId === 'number' && Number.isSafeInteger(data.reportId) &&
                 typeof data.editToken === 'string' && typeof data.editableUntil === 'string' &&
                 Number.isFinite(Date.parse(data.editableUntil))) {
        setSavedReport({
          reportId: data.reportId,
          editToken: data.editToken,
          editableUntil: Date.parse(data.editableUntil),
          level,
        })
      } else {
        // Saved on the API but editing is unavailable: don't invite duplicate POSTs.
        setCorrectionExpired(true)
        setError('Your report was saved, but it cannot be corrected in this session.')
      }
      onSuccess()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your report.')
    } finally {
      requestInFlight.current = false
      setPendingLevel(null)
      setSubmitting(false)
    }
  }

  // Keep the server-confirmed choice highlighted while a change is in flight.
  // An unsuccessful request must never look like it was saved.
  const highlighted = savedReport?.level ?? null
  const savedSuccessfully = highlighted !== null
  const hasReportToken = savedReport !== null

  return (
    <div className="report-sheet">
      <ReportLocationPicker
        spaces={spaces}
        selected={selected}
        disabled={submitting || savedSuccessfully || correctionExpired}
        onSelect={onSelect}
      />
      {requiresBetaCode && (
        <div className="report-beta">
          <label htmlFor="report-beta-code" className="field-label">Beta access code</label>
          <input
            id="report-beta-code"
            type="password"
            autoComplete="off"
            className="report-beta__input"
            placeholder="Enter the pilot invite code"
            value={betaAccessCode}
            onChange={(event) => onBetaAccessCodeChange(event.target.value)}
            disabled={submitting}
          />
          <p className="report-beta__hint">For pilot testers only. The code stays in this open tab.</p>
        </div>
      )}
      <p className="field-label report-question">How busy is it right now?</p>
      <div className="report-options" role="group" aria-label="Report busyness; tap the selected answer again to undo it">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={'report-choice' + (highlighted === option.id || (submitting && pendingLevel === option.id) ? ' report-choice--active' : '')}
            aria-pressed={highlighted === option.id}
            disabled={submitting || correctionExpired}
            onClick={() => { void submit(option.id) }}
          >
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
            {submitting && pendingLevel === option.id
              ? <LoaderCircle className="loading-spin" size={21} aria-hidden="true" />
              : highlighted === option.id
                ? <CheckCircle2 size={21} aria-hidden="true" />
                : <span className="report-choice__circle" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p
        className={'report-disclaimer' + (error ? ' report-disclaimer--error' : savedSuccessfully ? ' report-disclaimer--saved' : '')}
        role="status"
        aria-live="polite"
      >
        {savedSuccessfully && !error
          ? <CheckCircle2 size={16} aria-hidden="true" />
          : <Info size={16} aria-hidden="true" />}
        {error
          ? error
          : submitting
            ? hasReportToken ? 'Updating your report…' : 'Saving your report…'
            : savedSuccessfully
              ? 'Saved! Tap the selected option again to undo, or another option to correct it within 2 minutes.'
              : hasReportToken
                ? 'Selection removed — your vote is no longer counted. Tap an option to report again within 2 minutes.'
                : 'Tap an option to submit. Only report what you see in person.'}
      </p>
    </div>
  )
}
