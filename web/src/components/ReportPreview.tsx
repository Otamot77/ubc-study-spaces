import { CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import type { StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  onSelect: (id: string) => void
}

const options = [
  { id: 'low', label: 'Plenty of seats', detail: 'Lots of places to sit' },
  { id: 'moderate', label: 'Some seats', detail: 'Some spots are open' },
  { id: 'high', label: 'Almost full', detail: 'Very limited seating' },
] as const

export function ReportPreview({ spaces, selected, onSelect }: Props) {
  const [choice, setChoice] = useState<string | null>(null)

  return (
    <div className="report-sheet">
      <label className="field-label" htmlFor="report-location">Study space</label>
      <select className="field-select" id="report-location" value={selected.id} onChange={(event) => onSelect(event.target.value)}>
        {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
      </select>
      <p className="field-label report-question">How busy is it right now?</p>
      <div className="report-options" role="group" aria-label="Example busyness report">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={'report-choice' + (choice === option.id ? ' report-choice--active' : '')}
            aria-pressed={choice === option.id}
            onClick={() => setChoice(option.id)}
          >
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
            {choice === option.id ? <CheckCircle2 size={21} aria-hidden="true" /> : <span className="report-choice__circle" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="report-disclaimer">
        <Info size={16} aria-hidden="true" />
        {choice
          ? 'Preview selection saved on this screen only. No report was submitted.'
          : 'This is an interface preview. Reports are not sent or stored yet.'}
      </p>
    </div>
  )
}
