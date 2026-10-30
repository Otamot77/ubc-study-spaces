import { ChevronDown, Compass, Info, List, Map as MapIcon, MapPin, MessageCirclePlus, Navigation, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BottomSheet } from './components/BottomSheet'
import { ExploreFilters } from './components/ExploreFilters'
import { BusynessIndicator } from './components/BusynessIndicator'
import { MapView } from './components/MapView'
import { LocationPicker } from './components/LocationPicker'
import { ReportPreview } from './components/ReportPreview'
import { StudySpaceCard } from './components/StudySpaceCard'
import { directionsUrl, sortStudySpaces } from './lib/sortStudySpaces'
import { formatDistance, withDistances } from './lib/distance'
import { filterExploreSpaces } from './lib/filterExploreSpaces'
import type { AvailabilityFilter } from './lib/filterExploreSpaces'
import type { SortMode, StartingPoint, StudySpace } from './types'

type ViewMode = 'list' | 'map'
type SheetMode = 'details' | 'report' | 'location' | null

const sortOptions: { id: SortMode; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'least-busy', label: 'Least busy' },
  { id: 'closest', label: 'Closest' },
]

export default function App() {
  const [view, setView] = useState<ViewMode>('list')
  const [sort, setSort] = useState<SortMode>('recommended')
  const [exploreQuery, setExploreQuery] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetMode>(null)
  const [startingPoint, setStartingPoint] = useState<StartingPoint | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const gpsAttempt = useRef(0)
  const [sourceSpaces, setSourceSpaces] = useState<StudySpace[]>([])
  const [requiresBetaCode, setRequiresBetaCode] = useState(false)
  const [betaAccessCode, setBetaAccessCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    async function refresh() {
      try {
        const [response, configResponse] = await Promise.all([
          fetch('/api/spaces', { cache: 'no-store' }),
          fetch('/api/config', { cache: 'no-store' }),
        ])
        if (!response.ok || !configResponse.ok) throw new Error('Could not load study spaces')
        const data = await response.json() as { spaces?: StudySpace[] }
        const config = await configResponse.json() as { betaAccessRequired?: boolean }
        if (!Array.isArray(data.spaces)) throw new Error('Invalid API response')
        if (!active) return
        setSourceSpaces((previous) =>
          JSON.stringify(previous) === JSON.stringify(data.spaces) ? previous : data.spaces!)
        setRequiresBetaCode(config.betaAccessRequired === true)
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

  const locatedSpaces = useMemo(
    () => withDistances(sourceSpaces, startingPoint),
    [sourceSpaces, startingPoint],
  )
  const spaces = useMemo(() => sortStudySpaces(locatedSpaces, sort), [locatedSpaces, sort])
  const visibleSpaces = useMemo(
    () => filterExploreSpaces(spaces, exploreQuery, availabilityFilter),
    [spaces, exploreQuery, availabilityFilter],
  )
  // Reports and details must always reference the full catalog, not search results.
  const selectedSpace = spaces.find((space) => space.id === selectedId) ?? spaces[0]

  function openLocationPicker() {
    setLocationError(null)
    setSheet('location')
  }

  function chooseStartingPoint(space: StudySpace) {
    gpsAttempt.current += 1 // Ignore an older browser GPS callback.
    setLocating(false)
    setLocationError(null)
    setStartingPoint({ source: 'manual', label: space.name, coordinates: space.coordinates })
    setSort('closest')
    setSheet(null)
  }

  function clearStartingPoint() {
    gpsAttempt.current += 1
    setLocating(false)
    setStartingPoint(null)
    setSort('recommended')
    setLocationError(null)
    setSheet(null)
  }

  function useGps() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError('GPS needs HTTPS on phones. For local Wi-Fi testing, choose a campus building below.')
      return
    }

    const attempt = ++gpsAttempt.current
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (attempt !== gpsAttempt.current) return
        setLocating(false)
        const { latitude, longitude, accuracy } = position.coords
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setLocationError('Your browser returned an invalid position. Choose a campus building instead.')
          return
        }
        setStartingPoint({
          source: 'gps',
          label: 'My location',
          coordinates: { lat: latitude, lng: longitude },
          accuracyMeters: Number.isFinite(accuracy) ? Math.round(accuracy) : undefined,
        })
        setSort('closest')
        setSheet(null)
      },
      (error) => {
        if (attempt !== gpsAttempt.current) return
        setLocating(false)
        const message = error.code === 1
          ? 'Location permission was denied. Choose a campus building instead.'
          : error.code === 3
            ? 'Could not determine your location in time. Try again or choose a building.'
            : 'Your position is unavailable. Choose a campus building instead.'
        setLocationError(message)
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    )
  }

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
        <button
          type="button"
          className="toolbar__origin"
          onClick={openLocationPicker}
          aria-label={startingPoint ? `Change starting point: ${startingPoint.label}` : 'Choose your starting point'}
          aria-haspopup="dialog"
        >
          <MapPin size={16} aria-hidden="true" />
          <span className="toolbar__origin-text">
            <span className="toolbar__origin-prefix">From</span>
            <strong>{startingPoint?.label ?? 'Choose starting point'}</strong>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {view === 'list' && (
          <div className="sort-buttons" role="group" aria-label="Sort study spaces">
            {sortOptions.map((option) => {
              return (
                <button
                  key={option.id}
                  type="button"
                  className={'sort-button' + (sort === option.id ? ' sort-button--active' : '')}
                  aria-pressed={sort === option.id}
                  onClick={() => {
                    if (option.id === 'closest' && !startingPoint) {
                      openLocationPicker()
                      return
                    }
                    setSort(option.id)
                    listRef.current?.scrollTo({ top: 0, behavior: 'auto' })
                  }}
                >
                  {option.label}
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
            Busyness comes from unverified recent reports. {startingPoint ? 'Distances are approximate straight-line, not walking routes.' : 'Choose a starting point to find the closest space.'}
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
              <ExploreFilters
                query={exploreQuery}
                status={availabilityFilter}
                onQueryChange={setExploreQuery}
                onStatusChange={setAvailabilityFilter}
              />
              <div className="list-title">
                <h2>Study spaces</h2>
                <span>{visibleSpaces.length} of {spaces.length}</span>
              </div>
              {visibleSpaces.length ? (
                <section className="space-list" aria-label="Study spaces">
                  {visibleSpaces.map((space) => (
                    <StudySpaceCard
                      key={space.id}
                      space={space}
                      selected={selectedId === space.id}
                      onSelect={() => showDetails(space)}
                    />
                  ))}
                </section>
              ) : (
                <div className="explore-filters__empty" role="status">
                  <strong>No spaces match those filters.</strong>
                  <p>Try another name or reported status. A lack of recent reports means Unknown, not available.</p>
                  <button
                    type="button"
                    className="action action--secondary"
                    onClick={() => { setExploreQuery(''); setAvailabilityFilter('all') }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              <p className="list-end">{visibleSpaces.length === spaces.length ? 'All' : 'Showing'} {visibleSpaces.length} campus study locations · Google Maps handles walking routes</p>
            </>
          )}
        </div>
        {view === 'map' && (
          <div className="map-region">
            {apiError || loading || !sourceSpaces.length
              ? <div className="map-unavailable" role="status">{loading ? 'Loading map locations…' : apiError || 'No locations available.'}</div>
              : <MapView
                  spaces={locatedSpaces}
                  origin={startingPoint}
                  selected={selectedId ? selectedSpace ?? null : null}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDetails={() => { if (selectedSpace) showDetails(selectedSpace) }}
                  onChooseOrigin={openLocationPicker}
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
                <><MapPin size={16} aria-hidden="true" /> {selectedSpace.distanceMeters === null ? 'UBC campus' : formatDistance(selectedSpace.distanceMeters)}</>
              </span>
            </div>
            <p className="detail-freshness">
              {selectedSpace.recentReportCount > 0
                ? `${selectedSpace.recentReportCount} recent reports · Latest ${selectedSpace.latestReportMinutesAgo} min ago · ${selectedSpace.confidence} confidence`
                : 'No recent reports'}
            </p>
            <p className="sheet-note">Reports expire after 45 minutes. Occupancy is unverified. {selectedSpace.distanceMeters !== null && 'Distances are straight-line estimates, not walking distances.'}</p>
            {selectedSpace.address && (
              <div className="space-info">
                <p className="space-info__eyebrow">{selectedSpace.category === 'library' ? 'Library' : selectedSpace.category === 'learning-commons' ? 'Learning commons' : selectedSpace.category === 'informal' ? 'Informal study area' : 'Campus building'}</p>
                <p className="space-info__address"><MapPin size={15} aria-hidden="true" /> {selectedSpace.address}</p>
                {selectedSpace.studyNotes && <p className="space-info__note">{selectedSpace.studyNotes}</p>}
                {selectedSpace.verification !== 'confirmed' && (
                  <p className="space-info__caution">
                    {selectedSpace.verification === 'building-only'
                      ? 'Study seating and public access at this building are not yet verified.'
                      : 'Study area access or availability needs another on-campus check.'}
                  </p>
                )}
                <div className="space-info__links">
                  {selectedSpace.sourceUrl && (
                    <a href={selectedSpace.sourceUrl} target="_blank" rel="noopener noreferrer">
                      UBC source <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  )}
                  {selectedSpace.hoursUrl && (
                    <a href={selectedSpace.hoursUrl} target="_blank" rel="noopener noreferrer">
                      Check current hours <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            )}
            <a href={directionsUrl(selectedSpace)} className="action action--primary" target="_blank" rel="noopener noreferrer">
              <Navigation size={18} aria-hidden="true" /> Get directions <ExternalLink size={15} aria-hidden="true" />
            </a>
            <button className="action action--secondary" type="button" onClick={() => setSheet('report')}>
              <MessageCirclePlus size={18} aria-hidden="true" /> Report busyness
            </button>
          </div>
        </BottomSheet>
      )}

      {sheet === 'location' && (
        <BottomSheet key="location" title="Starting point" onClose={() => setSheet(null)}>
          <LocationPicker
            spaces={locatedSpaces}
            origin={startingPoint}
            locating={locating}
            error={locationError}
            onUseGps={useGps}
            onChoose={chooseStartingPoint}
            onClear={clearStartingPoint}
          />
        </BottomSheet>
      )}

      {sheet === 'report' && selectedSpace && (
        <BottomSheet key="report" title="Report busyness" onClose={() => setSheet(null)}>
          <ReportPreview
            spaces={spaces}
            selected={selectedSpace}
            onSelect={setSelectedId}
            onSuccess={() => setRefreshToken((value) => value + 1)}
            requiresBetaCode={requiresBetaCode}
            betaAccessCode={betaAccessCode}
            onBetaAccessCodeChange={setBetaAccessCode}
          />
        </BottomSheet>
      )}
    </div>
  )
}
