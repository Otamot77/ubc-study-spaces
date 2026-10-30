import { ChevronRight, LocateFixed } from 'lucide-react'
import { useState } from 'react'
import type { StartingPoint, StudySpace } from '../types'
import { formatDistance } from '../lib/distance'
import { BusynessIndicator } from './BusynessIndicator'
import { CampusMap } from './CampusMap'

interface Props {
  spaces: readonly StudySpace[]
  origin: StartingPoint | null
  selected: StudySpace | null
  selectedId: string | null
  onSelect: (id: string) => void
  onDetails: () => void
  onChooseOrigin: () => void
}

/**
 * Map mode is geographic discovery. The button moves the camera only,
 * without requesting GPS or changing the selected building.
 */
export function MapView({ spaces, origin, selected, selectedId, onSelect, onDetails, onChooseOrigin }: Props) {
  const [originFocusRequest, setOriginFocusRequest] = useState(0)

  return (
    <section className="map-preview" aria-label="UBC campus map">
      <CampusMap
        spaces={spaces}
        origin={origin}
        selectedId={selectedId}
        onSelect={onSelect}
        originFocusRequest={originFocusRequest}
      />
      <button
        className={'map-recenter' + (selected ? ' map-recenter--above-card' : '')}
        type="button"
        title={origin ? 'Center map on starting point' : 'Choose a starting point'}
        aria-label={origin ? 'Center map on starting point' : 'Choose a starting point to center the map'}
        onClick={() => {
          if (origin) setOriginFocusRequest((previous) => previous + 1)
          else onChooseOrigin()
        }}
      >
        <LocateFixed size={21} strokeWidth={2} aria-hidden="true" />
      </button>
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
              <span className="map-selection-card__demo">
                {selected.distanceMeters === null
                  ? (selected.recentReportCount
                    ? `${selected.recentReportCount} recent reports`
                    : 'No recent reports')
                  : formatDistance(selected.distanceMeters)}
              </span>
            </span>
          </span>
          <ChevronRight size={20} className="map-selection-card__chevron" aria-hidden="true" />
        </button>
      )}
    </section>
  )
}
