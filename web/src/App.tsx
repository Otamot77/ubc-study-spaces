import { Compass, Footprints, Info, List, Map as MapIcon, MapPin, MessageCirclePlus, Navigation, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BottomSheet } from './components/BottomSheet'
import { BusynessIndicator } from './components/BusynessIndicator'
import { MapView } from './components/MapView'
import { ReportPreview } from './components/ReportPreview'
import { StudySpaceCard } from './components/StudySpaceCard'
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
  const [sourceSpaces, setSourceSpaces] = useState<StudySpace[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const response = await fetch('/api/spaces', { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not load study spaces')
        const data = await response.json() as { spaces?: StudySpace[] }
        if (!Array.isArray(data.spaces)) throw new Error('Invalid API response')
        if (!active) return
        setSourceSpaces((previous) =>
          JSON.stringify(previous) === JSON.stringify(data.spaces) ? previous : data.spaces!)
        setApiError(null)
      } catch {
        if (!active) return
        // Never show potentially stale occupancy as if it were current.
        setSourceSpaces([])
        setApiError('Could not reach the reporting API. Start the backend server and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    const interval = window.setInterval(() => { void refresh() }, 30_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [refreshToken])

  const spaces = useMemo(() => sortStudySpaces(sourceSpaces, sort), [sourceSpaces, sort])
  const selectedSpace = spaces.find((space) => space.id === selectedId) ?? spaces[0]
  const closestAvailable = sourceSpaces.some((space) => space.walkingMinutes !== null)

  function showDetails(space: StudySpace) {
    setSelectedId(space.id)
    setSheet('details')
  }

  function showReport() {
    if (!spaces.length) return
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
        <div className="site-header__location">
          <MapPin size={14} aria-hidden="true" /> UBC Vancouver
          <span className="demo-pill">{loading ? 'Connecting' : apiError ? 'Offline' : 'Crowdsourced'}</span>
        </div>
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
        {view === 'list' && (
          <div className="sort-buttons" role="group" aria-label="Sort study spaces">
            {sortOptions.map((option) => {
              const disabled = option.id === 'closest' && !closestAvailable
              return (
                <button
                  key={option.id}
                  type="button"
                  className={'sort-button' + (sort === option.id ? ' sort-button--active' : '')}
                  aria-pressed={sort === option.id}
                  disabled={disabled}
                  title={disabled ? 'Closest requires location-based walking times, coming later' : undefined}
                  onClick={() => {
                    setSort(option.id)
                    listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                  }}
                >
                  {disabled ? 'Closest · Soon' : option.label}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <main className="content-viewport">
        <div className="list-scroller" ref={listRef} hidden={view !== 'list'}>
          <p className="demo-notice" role="note">
            <Info size={16} aria-hidden="true" />
            Busyness is based on anonymous recent reports, not verified seat counts. No reports means Unknown.
          </p>
          {loading && <p className="api-state" role="status">Loading study spaces…</p>}
          {apiError && (
            <div className="api-state api-state--error" role="alert">
              <span>{apiError}</span>
              <button type="button" className="action action--secondary" onClick={() => setRefreshToken((value) => value + 1)}>Retry</button>
            </div>
          )}
          {!loading && !apiError && (
            <>
              <div className="list-title">
                <h2>Study spaces</h2>
                <span>{spaces.length} buildings</span>
              </div>
              <section className="space-list" aria-label="Study spaces">
                {spaces.map((space) => (
                  <StudySpaceCard
                    key={space.id}
                    space={space}
                    selected={selectedId === space.id}
                    onSelect={() => showDetails(space)}
                  />
                ))}
              </section>
              <p className="list-end">All {spaces.length} campus buildings shown · No live walking-time estimates yet</p>
            </>
          )}
        </div>
        {view === 'map' && (
          <div className="map-region">
            {apiError || loading || !sourceSpaces.length
              ? <div className="map-unavailable" role="status">{loading ? 'Loading map locations…' : apiError || 'No locations available.'}</div>
              : <MapView
                  spaces={sourceSpaces}
                  selected={selectedId ? selectedSpace ?? null : null}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDetails={() => { if (selectedSpace) showDetails(selectedSpace) }}
                />}
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button className={'nav-button' + (sheet !== 'report' ? ' nav-button--active' : '')} type="button" onClick={explore}>
          <Compass size={21} strokeWidth={1.9} aria-hidden="true" />
          <span>Explore</span>
        </button>
        <button className={'nav-button' + (sheet === 'report' ? ' nav-button--active' : '')} type="button" onClick={showReport} disabled={!spaces.length}>
          <MessageCirclePlus size={21} strokeWidth={1.9} aria-hidden="true" />
          <span>Report</span>
        </button>
      </nav>

      {sheet === 'details' && selectedSpace && (
        <BottomSheet key="details" title={selectedSpace.name} onClose={() => setSheet(null)}>
          <div className="details-sheet">
            <div className="details-sheet__facts">
              <BusynessIndicator busyness={selectedSpace.busyness} />
              <span className="walking-time">
                {selectedSpace.walkingMinutes === null
                  ? <><MapPin size={16} aria-hidden="true" /> UBC campus</>
                  : <><Footprints size={16} aria-hidden="true" /> {selectedSpace.walkingMinutes} min walk</>}
              </span>
            </div>
            <p className="detail-freshness">
              {selectedSpace.recentReportCount > 0
                ? `${selectedSpace.recentReportCount} recent reports · Latest ${selectedSpace.latestReportMinutesAgo} min ago · ${selectedSpace.confidence} confidence`
                : 'No recent reports'}
            </p>
            <p className="sheet-note">Reports expire from the estimate after 45 minutes. These are unverified observations, not confirmed seat counts.</p>
            <a href={directionsUrl(selectedSpace)} className="action action--primary" target="_blank" rel="noopener noreferrer">
              <Navigation size={18} aria-hidden="true" /> Get directions <ExternalLink size={15} aria-hidden="true" />
            </a>
            <button className="action action--secondary" type="button" onClick={() => setSheet('report')}>
              <MessageCirclePlus size={18} aria-hidden="true" /> Report busyness
            </button>
          </div>
        </BottomSheet>
      )}

      {sheet === 'report' && selectedSpace && (
        <BottomSheet key="report" title="Report busyness" onClose={() => setSheet(null)}>
          <ReportPreview
            spaces={spaces}
            selected={selectedSpace}
            onSelect={setSelectedId}
            onSuccess={() => setRefreshToken((value) => value + 1)}
          />
        </BottomSheet>
      )}
    </div>
  )
}
