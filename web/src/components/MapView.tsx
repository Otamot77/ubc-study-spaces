import { ChevronRight } from 'lucide-react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'
import { CampusMap } from './CampusMap'

interface Props {
  spaces: readonly StudySpace[]
  selected: StudySpace | null
  selectedId: string | null
  onSelect: (id: string) => void
  onDetails: () => void
}

/**
 * Map mode is geographic discovery: every marker remains visible.
 * List sorting does not apply to the positions of buildings on the map.
 */
export function MapView({ spaces, selected, selectedId, onSelect, onDetails }: Props) {
  return (
    <section className="map-preview" aria-label="UBC campus map">
      <CampusMap spaces={spaces} selectedId={selectedId} onSelect={onSelect} />
      {selected && (
        <button
          className="map-selection-card"
          type="button"
          onClick={onDetails}
          aria-label={`Open details for ${selected.name}`}
        >
          <span className="map-selection-card__info">
            <strong className="map-selection-card__name">{selected.name}</strong>
            <span className="map-selection-card__meta">
              <BusynessIndicator busyness={selected.busyness} />
              <span className="map-selection-card__demo">Sample data</span>
            </span>
          </span>
          <ChevronRight size={20} className="map-selection-card__chevron" aria-hidden="true" />
        </button>
      )}
    </section>
  )
}
