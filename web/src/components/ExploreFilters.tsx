import { Search, X } from 'lucide-react'
import type { AvailabilityFilter } from '../lib/filterExploreSpaces'

interface Props {
  query: string
  status: AvailabilityFilter
  onQueryChange: (value: string) => void
  onStatusChange: (value: AvailabilityFilter) => void
}

const options: { value: AvailabilityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Plenty' },
  { value: 'moderate', label: 'Some seats' },
  { value: 'high', label: 'Almost full' },
  { value: 'unknown', label: 'Unknown' },
]

export function ExploreFilters({ query, status, onQueryChange, onStatusChange }: Props) {
  return (
    <section className="explore-filters" aria-label="Search and filter study spaces">
      <div className="explore-filters__search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search study spaces"
          placeholder="Search by name or building…"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear study-space search"
            onClick={() => onQueryChange('')}
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="explore-filters__statuses" role="group" aria-label="Filter by reported busyness">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={'explore-filters__status' + (status === option.value ? ' explore-filters__status--active' : '')}
            aria-pressed={status === option.value}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  )
}
