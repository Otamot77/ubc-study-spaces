import { ChevronDown, ExternalLink, Navigation } from 'lucide-react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'
import { CampusMap } from './CampusMap'
import { directionsUrl } from '../lib/sortStudySpaces'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace
  selectedId: string | null
  onSelect: (id: string) => void
  onDetails: () => void
}

export function MapView({ spaces, selected, selectedId, onSelect, onDetails }: Props) {
  return (
    <section className="map-preview" aria-label="UBC campus map">
      <CampusMap spaces={spaces} selectedId={selectedId} onSelect={onSelect} />
      <div className="map-preview__card">
        <label className="map-preview__label" htmlFor="map-selected-space">
          Selected study space
        </label>
        <div className="map-preview__select-wrap">
          <select
            id="map-selected-space"
            value={selected.id}
            onChange={(event) => onSelect(event.target.value)}
          >
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>{space.name}</option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        <div className="map-preview__summary">
          <BusynessIndicator busyness={selected.busyness} />
          <span className="walking-time">{selected.walkingMinutes} min walk*</span>
        </div>
        <div className="map-preview__actions">
          <button className="action action--secondary" type="button" onClick={onDetails}>Details</button>
          <a
            className="action action--primary"
            href={directionsUrl(selected)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Directions <Navigation size={16} aria-hidden="true" />
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
        <p className="map-preview__footnote">Real building markers · *Sample busyness and walking times</p>
      </div>
    </section>
  )
}
