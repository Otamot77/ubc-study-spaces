import { ExternalLink, MapPinned, Navigation } from 'lucide-react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'
import { directionsUrl } from '../lib/sortStudySpaces'

interface Props {
  selected: StudySpace
}

export function MapPlaceholder({ selected }: Props) {
  return (
    <section className="map-preview" aria-label="Map view preview">
      <div className="map-preview__centre">
        <div className="map-preview__icon">
          <MapPinned size={29} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <h2>Campus map coming next</h2>
        <p>The full-screen interactive map will go here. No locations are plotted yet.</p>
      </div>

      <div className="map-preview__card">
        <div className="map-preview__card-head">
          <div>
            <p className="eyebrow">Selected study space</p>
            <h3>{selected.name}</h3>
          </div>
          <span className="map-preview__walking"><Navigation size={14} aria-hidden="true" /> {selected.walkingMinutes} min*</span>
        </div>
        <BusynessIndicator busyness={selected.busyness} />
        <a
          className="action action--primary map-preview__directions"
          href={directionsUrl(selected)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get directions <ExternalLink size={16} aria-hidden="true" />
        </a>
        <p className="map-preview__footnote">*Illustrative walking time</p>
      </div>
    </section>
  )
}
