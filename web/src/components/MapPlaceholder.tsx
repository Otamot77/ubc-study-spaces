import { ChevronDown, ExternalLink, MapPinned } from 'lucide-react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'
import { directionsUrl } from '../lib/sortStudySpaces'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  onSelect: (id: string) => void
  onDetails: () => void
}

export function MapPlaceholder({ spaces, selected, onSelect, onDetails }: Props) {
  return (
    <section className="map-preview" aria-label="Map view preview">
      <div className="map-preview__centre">
        <span className="map-preview__icon"><MapPinned size={30} aria-hidden="true" /></span>
        <h2>Map coming next</h2>
        <p>A full-screen campus map will live here. No fictional markers are plotted.</p>
      </div>
      <div className="map-preview__card">
        <label className="map-preview__label" htmlFor="map-selected-space">Preview a study space</label>
        <div className="map-preview__select-wrap">
          <select
            id="map-selected-space"
            value={selected.id}
            onChange={(event) => onSelect(event.target.value)}
          >
            {spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        <div className="map-preview__summary">
          <BusynessIndicator busyness={selected.busyness} />
          <span className="walking-time">{selected.walkingMinutes} min walk*</span>
        </div>
        <div className="map-preview__actions">
          <button className="action action--secondary" type="button" onClick={onDetails}>Details</button>
          <a className="action action--primary" href={directionsUrl(selected)} target="_blank" rel="noopener noreferrer">
            Directions <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="map-preview__footnote">*Illustrative time and crowding · Map not connected</p>
      </div>
    </section>
  )
}
