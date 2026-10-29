import { Check, ChevronDown, MapPin } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  disabled: boolean
  onSelect: (id: string) => void
}

/**
 * A compact disclosure rather than a native mobile select/picker.
 * Uses ordinary focusable buttons and a bounded scrolling area inside the sheet.
 */
export function ReportLocationPicker({ spaces, selected, disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  function choose(id: string) {
    setOpen(false)
    onSelect(id)
    triggerRef.current?.focus()
  }

  return (
    <div className="report-location">
      <span className="field-label" id={listId + '-label'}>Study space</span>
      <button
        className={'report-location__trigger' + (open ? ' report-location__trigger--open' : '')}
        type="button"
        disabled={disabled}
        ref={triggerRef}
        aria-labelledby={listId + '-label ' + listId + '-value'}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="report-location__icon" aria-hidden="true">
          <MapPin size={18} strokeWidth={2} />
        </span>
        <span className="report-location__name" id={listId + '-value'}>{selected.name}</span>
        <ChevronDown size={19} className="report-location__chevron" aria-hidden="true" />
      </button>
      {open && !disabled && (
        <div
          className="report-location__options"
          id={listId}
          role="group"
          aria-label="Choose study space"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              setOpen(false)
              triggerRef.current?.focus()
            }
          }}
        >
          {spaces.map((space) => (
            <button
              type="button"
              key={space.id}
              className={'report-location__option' +
                (selected.id === space.id ? ' report-location__option--selected' : '')}
              aria-pressed={selected.id === space.id}
              onClick={() => choose(space.id)}
            >
              <span>{space.name}</span>
              {selected.id === space.id && <Check size={17} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
