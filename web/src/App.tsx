import { Compass, Info, List, Map as MapIcon, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapPlaceholder } from './components/MapPlaceholder'
import { StudySpaceCard } from './components/StudySpaceCard'
import { demoStudySpaces } from './data/studySpaces'
import { sortStudySpaces } from './lib/sortStudySpaces'
import type { SortMode } from './types'

type ViewMode = 'list' | 'map'

const sortOptions: { id: SortMode; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'least-busy', label: 'Least busy' },
  { id: 'closest', label: 'Closest' },
]

export default function App() {
  const [view, setView] = useState<ViewMode>('list')
  const [sort, setSort] = useState<SortMode>('recommended')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const spaces = useMemo(() => sortStudySpaces(demoStudySpaces, sort), [sort])
  const selectedSpace = spaces.find((space) => space.id === selectedId) ?? spaces[0]

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__location"><MapPin size={15} aria-hidden="true" /> UBC Vancouver</div>
        <h1>Find your spot.</h1>
        <p className="site-header__subtitle">Less searching. More studying.</p>
      </header>

      <main>
        <div className="controls">
          <div className="sort-controls">
            <span className="control-label">Sort by</span>
            <div className="sort-buttons" role="group" aria-label="Sort study spaces">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={'sort-button' + (sort === option.id ? ' sort-button--active' : '')}
                  aria-pressed={sort === option.id}
                  onClick={() => setSort(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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

        <p className="demo-banner" role="note">
          <Info size={16} aria-hidden="true" />
          Design preview — all crowding reports and walking times are illustrative.
        </p>

        {view === 'list' ? (
          <section className="list-view" aria-label="Study spaces">
            <div className="section-heading">
              <h2>Study spaces</h2>
              <span>{spaces.length} sample spots</span>
            </div>
            <div className="space-list">
              {spaces.map((space) => (
                <StudySpaceCard
                  key={space.id}
                  space={space}
                  expanded={selectedId === space.id}
                  onToggle={() => setSelectedId((current) => current === space.id ? null : space.id)}
                />
              ))}
            </div>
          </section>
        ) : (
          <MapPlaceholder selected={selectedSpace} />
        )}
      </main>

      <footer className="footer">
        <Compass size={16} aria-hidden="true" />
        <span>Made for studying at UBC · Prototype, not live data</span>
      </footer>
    </div>
  )
}
