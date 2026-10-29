import { ChevronRight, Footprints } from 'lucide-react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'

interface Props {
  space: StudySpace
  selected: boolean
  onSelect: () => void
}

export function StudySpaceCard({ space, selected, onSelect }: Props) {
  const reportMeta = space.recentReportCount === 0
    ? 'No recent sample reports'
    : `${space.recentReportCount} sample reports · Latest ${space.latestReportMinutesAgo} min ago`

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
            <Footprints size={16} strokeWidth={1.8} aria-hidden="true" />
            {space.walkingMinutes} min walk
          </span>
          <BusynessIndicator busyness={space.busyness} />
        </div>
        <p className="report-meta">{reportMeta}</p>
      </button>
    </article>
  )
}
