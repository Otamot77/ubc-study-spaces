import { ChevronRight, MapPin } from 'lucide-react'
import { formatDistance } from '../lib/distance'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'

interface Props {
  space: StudySpace
  selected: boolean
  onSelect: () => void
}

export function StudySpaceCard({ space, selected, onSelect }: Props) {
  const reportMeta = space.recentReportCount === 0
    ? 'No recent reports · Status unknown'
    : `${space.recentReportCount} recent ${space.recentReportCount === 1 ? 'report' : 'reports'} · Latest ${space.latestReportMinutesAgo} min ago · ${space.confidence} confidence`

  return (
    <article className={'space-card' + (selected ? ' space-card--selected' : '')}>
      <button
        className="space-card__button"
        type="button"
        onClick={onSelect}
        aria-label={`View details for ${space.name}`}
      >
        <div className="space-card__heading">
          <h3 className="space-card__name">{space.name}</h3>
          <ChevronRight size={18} aria-hidden="true" />
        </div>
        <div className="space-card__summary">
          <span className="walking-time">
            <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
            {space.distanceMeters === null ? 'UBC campus' : formatDistance(space.distanceMeters)}
          </span>
          <BusynessIndicator busyness={space.busyness} />
        </div>
        <p className="report-meta">{reportMeta}</p>
      </button>
    </article>
  )
}
