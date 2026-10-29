import { CheckCircle2, Info, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ReportLocationPicker } from './ReportLocationPicker'
import type { StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  onSelect: (id: string) => void
  onSuccess: () => void
}

const options = [
  { id: 'low', label: 'Plenty of seats', detail: 'Lots of places to sit' },
  { id: 'moderate', label: 'Some seats', detail: 'Some spots are open' },
  { id: 'high', label: 'Almost full', detail: 'Very limited seating' },
] as const

export function ReportPreview({ spaces, selected, onSelect, onSuccess }: Props) {
  const [choice, setChoice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Switching locations should not carry an earlier failed selection or message.
  useEffect(() => {
    setChoice(null)
    setSaved(false)
    setError(null)
  }, [selected.id])

  async function submit(level: (typeof options)[number]['id']) {
    if (submitting || saved) return
    setChoice(level)
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`/api/spaces/${encodeURIComponent(selected.id)}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error || `Report failed (${response.status})`)
      }
      setSaved(true)
      onSuccess()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="report-sheet">
      <ReportLocationPicker
        spaces={spaces}
        selected={selected}
        disabled={submitting || saved}
        onSelect={onSelect}
      />
      <p className="field-label report-question">How busy is it right now?</p>
      <div className="report-options" role="group" aria-label="Submit a busyness report">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={'report-choice' + (choice === option.id ? ' report-choice--active' : '')}
            aria-pressed={choice === option.id}
            disabled={submitting || saved}
            onClick={() => { void submit(option.id) }}
          >
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
            {submitting && choice === option.id
              ? <LoaderCircle className="loading-spin" size={21} aria-hidden="true" />
              : choice === option.id
                ? <CheckCircle2 size={21} aria-hidden="true" />
                : <span className="report-choice__circle" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className={'report-disclaimer' + (error ? ' report-disclaimer--error' : '')} role="status" aria-live="polite">
        <Info size={16} aria-hidden="true" />
        {saved
          ? 'Report saved! Thank you. Your submission now contributes to recent occupancy.'
          : error || (submitting
            ? 'Submitting your report…'
            : 'Tap one option to submit a real anonymous report. Only report what you see in person.')}
      </p>
    </div>
  )
}
