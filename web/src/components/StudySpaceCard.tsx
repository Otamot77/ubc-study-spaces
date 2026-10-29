import { ChevronDown, ChevronRight, ExternalLink, Footprints, MessageCirclePlus } from 'lucide-react'
import { useState } from 'react'
import type { StudySpace } from '../types'
import { BusynessIndicator } from './BusynessIndicator'
import { directionsUrl } from '../lib/sortStudySpaces'

interface Props {
  space: StudySpace
  expanded: boolean
  onToggle: () => void
}

const reportChoices = ['Plenty of seats', 'Some seats', 'Almost full'] as const

export function StudySpaceCard({ space, expanded, onToggle }: Props) {
  const [showReportPreview, setShowReportPreview] = useState(false)
  const [reportChoice, setReportChoice] = useState<string | null>(null)
  const reportMeta = space.recentReportCount === 0
    ? 'No recent sample reports'
    : space.recentReportCount + ' sample reports · Latest ' + space.latestReportMinutesAgo + ' min ago'

  return (
    <article className={'space-card' + (expanded ? ' space-card--expanded' : '')}>
      <button
        className="space-card__toggle"
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={'details-' + space.id}
      >
        <div className="space-card__top">
          <h3 className="space-card__name">{space.name}</h3>
          {expanded ? <ChevronDown aria-hidden="true" size={18} /> : <ChevronRight aria-hidden="true" size={18} />}
        </div>
        <div className="space-card__middle">
          <span className="walking-time">
            <Footprints size={16} strokeWidth={1.8} aria-hidden="true" />
            {space.walkingMinutes} min walk
          </span>
          <BusynessIndicator busyness={space.busyness} />
        </div>
        <p className="report-meta">{reportMeta}</p>
      </button>

      {expanded && (
        <div className="space-card__details" id={'details-' + space.id}>
          <p className="details-note">
            Preview only. Busyness, report freshness, and walking times are not live.
          </p>
          <div className="card-actions">
            <a
              className="action action--primary"
              href={directionsUrl(space)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <ExternalLink size={16} aria-hidden="true" />
            </a>
            <button
              className="action action--secondary"
              type="button"
              aria-expanded={showReportPreview}
              onClick={() => setShowReportPreview((value) => !value)}
            >
              <MessageCirclePlus size={17} aria-hidden="true" /> Try reporting
            </button>
          </div>

          {showReportPreview && (
            <div className="report-preview">
              <p className="report-preview__label">How busy is it? (interface preview)</p>
              <div className="report-preview__choices">
                {reportChoices.map((choice) => (
                  <button
                    className={'choice' + (reportChoice === choice ? ' choice--selected' : '')}
                    key={choice}
                    type="button"
                    aria-pressed={reportChoice === choice}
                    onClick={() => setReportChoice(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <p className="report-preview__note">
                {reportChoice
                  ? 'Selected: ' + reportChoice + '. Nothing was submitted or saved.'
                  : 'No account or submission is connected yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
