import { Check, Crosshair, Info, LoaderCircle, MapPin, X } from 'lucide-react'
import type { StartingPoint, StudySpace } from '../types'

interface Props {
  origin: StartingPoint | null
  spaces: readonly StudySpace[]
  locating: boolean
  error: string | null
  onUseGps: () => void
  onChoose: (space: StudySpace) => void
  onClear: () => void
}

export function LocationPicker({ origin, spaces, locating, error, onUseGps, onChoose, onClear }: Props) {
  return (
    <div className="location-picker">
      <p className="location-picker__intro">
        Choose where you're starting from. We'll sort campus spaces by approximate straight-line distance.
      </p>
      <button
        type="button"
        className="location-picker__gps"
        disabled={locating}
        onClick={onUseGps}
      >
        <span className="location-picker__gps-icon">
          {locating ? <LoaderCircle className="loading-spin" size={20} aria-hidden="true" /> : <Crosshair size={20} aria-hidden="true" />}
        </span>
        <span className="location-picker__gps-copy">
          <strong>{locating ? 'Finding your location…' : 'Use my location'}</strong>
          <small>Only with your permission</small>
        </span>
        {!locating && <MapPin size={17} color="#81909c" aria-hidden="true" />}
      </button>
      {error && <p className="location-picker__error" role="alert">{error}</p>}
      <p className="location-picker__divider"><span>Or choose a campus building</span></p>
      <div className="location-picker__landmarks" role="group" aria-label="Choose a starting building">
        {spaces.map((space) => {
          const selected = origin?.source === 'manual' && origin.label === space.name
          return (
            <button
              key={space.id}
              type="button"
              className={'location-picker__landmark' + (selected ? ' location-picker__landmark--selected' : '')}
              onClick={() => onChoose(space)}
            >
              <MapPin size={16} aria-hidden="true" />
              <span>{space.name}</span>
              {selected && <Check size={17} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
      {origin && (
        <button type="button" className="location-picker__clear" onClick={onClear}>
          <X size={16} aria-hidden="true" /> Clear starting point
        </button>
      )}
      <p className="location-picker__privacy">
        <Info size={15} aria-hidden="true" />
        Your selected position stays on this device, in this open app. We don't send it to the reporting server. Distances aren't walking routes.
      </p>
    </div>
  )
}
