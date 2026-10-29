import { Compass, Footprints, Info, List, Map as MapIcon, MapPin, MessageCirclePlus, Navigation, ExternalLink } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { BottomSheet } from './components/BottomSheet'
import { BusynessIndicator } from './components/BusynessIndicator'
import { MapView } from './components/MapView'
import { ReportPreview } from './components/ReportPreview'
import { StudySpaceCard } from './components/StudySpaceCard'
import { demoStudySpaces } from './data/studySpaces'
import { directionsUrl, sortStudySpaces } from './lib/sortStudySpaces'
import type { SortMode, StudySpace } from './types'

type ViewMode = 'list' | 'map'
type SheetMode = 'details' | 'report' | null

const sortOptions: { id: SortMode; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'least-busy', label: 'Least busy' },
  { id: 'closest', label: 'Closest' },
]

export default function App() {
  const [view, setView] = useState<ViewMode>('list')
  const [sort, setSort] = useState<SortMode>('recommended')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetMode>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const spaces = useMemo(() => sortStudySpaces(demoStudySpaces, sort), [sort])
  const selectedSpace = spaces.find((space) => space.id === selectedId) ?? spaces[0]

  function showDetails(space: StudySpace) {
    setSelectedId(space.id)
    setSheet('details')
  }

  function showReport() {
    setSelectedId((previous) => previous ?? spaces[0].id)
    setSheet('report')
  }

  function explore() {
    setSheet(null)
    setView('list')
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__location"><MapPin size={14} aria-hidden="true" /> UBC Vancouver <span className="demo-pill">Demo</span></div>
        <h1>Find your spot.</h1>
        <p className="site-header__subtitle">Less searching. More studying.</p>
      </header>

      <section className="toolbar" aria-label="Study space controls">
        <div className="toolbar__top">
          <h2 className="toolbar__heading">Explore spaces</h2>
          <div className="view-toggle" role="group" aria-label="Choose view">
            <button
              type="button"
              className={'view-button' + (view === 'list' ? ' view-button--active' : '')}
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <List size={16} aria-hidden="true" /> List
            </button>
            <button
              type="button"
              className={'view-button' + (view === 'map' ? ' view-button--active' : '')}
              aria-pressed={view === 'map'}
              onClick={() => setView('map')}
            >
              <MapIcon size={16} aria-hidden="true" /> Map
            </button>
          </div>
        </div>
        <div className="sort-buttons" role="group" aria-label="Sort study spaces">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={'sort-button' + (sort === option.id ? ' sort-button--active' : '')}
              aria-pressed={sort === option.id}
              onClick={() => {
                setSort(option.id)
                listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <main className="content-viewport">
        <div className="list-scroller" ref={listRef} hidden={view !== 'list'}>
          <p className="demo-notice" role="note">
            <Info size={16} aria-hidden="true" />
            Sample locations, walking times and crowd reports — not live information.
          </p>
          <div className="list-title">
            <h2>Study spaces</h2>
            <span>{spaces.length} examples</span>
          </div>
          <section className="space-list" aria-label="Study space examples">
            {spaces.map((space) => (
              <StudySpaceCard
                key={space.id}
                space={space}
                selected={selectedId === space.id}
                onSelect={() => showDetails(space)}
              />
            ))}
          </section>
          <p className="list-end">You've seen all {spaces.length} sample spaces.</p>
        </div>
        {view === 'map' && (
          <div className="map-region">
            <MapView
              spaces={demoStudySpaces}
              selected={selectedSpace}
              selectedId={selectedSpace.id}
              onSelect={setSelectedId}
              onDetails={() => showDetails(selectedSpace)}
            />
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className={'nav-button' + (sheet !== 'report' ? ' nav-button--active' : '')} type="button" onClick={explore}>
          <Compass size={21} strokeWidth={1.9} aria-hidden="true" />
          <span>Explore</span>
        </button>
        <button className={'nav-button' + (sheet === 'report' ? ' nav-button--active' : '')} type="button" onClick={showReport}>
          <MessageCirclePlus size={21} strokeWidth={1.9} aria-hidden="true" />
          <span>Report</span>
        </button>
      </nav>

      {sheet === 'details' && (
        <BottomSheet key="details" title={selectedSpace.name} onClose={() => setSheet(null)}>
          <div className="details-sheet">
            <div className="details-sheet__facts">
              <BusynessIndicator busyness={selectedSpace.busyness} />
              <span className="walking-time"><Footprints size={16} aria-hidden="true" /> {selectedSpace.walkingMinutes} min walk*</span>
            </div>
            <p className="detail-freshness">
              {selectedSpace.recentReportCount > 0
                ? `${selectedSpace.recentReportCount} example reports · Latest ${selectedSpace.latestReportMinutesAgo} min ago`
                : 'No recent example reports'}
            </p>
            <p className="sheet-note">Crowding and walking times are fictional preview data, not live availability.</p>
            <a href={directionsUrl(selectedSpace)} className="action action--primary" target="_blank" rel="noopener noreferrer">
              <Navigation size={18} aria-hidden="true" /> Get directions <ExternalLink size={15} aria-hidden="true" />
            </a>
            <button className="action action--secondary" type="button" onClick={() => setSheet('report')}>
              <MessageCirclePlus size={18} aria-hidden="true" /> Try reporting busyness
            </button>
          </div>
        </BottomSheet>
      )}

      {sheet === 'report' && (
        <BottomSheet key="report" title="Report busyness" onClose={() => setSheet(null)}>
          <ReportPreview
            key={selectedSpace.id}
            spaces={spaces}
            selected={selectedSpace}
            onSelect={setSelectedId}
          />
        </BottomSheet>
      )}
    </div>
  )
}
