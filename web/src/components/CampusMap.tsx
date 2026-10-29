import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Busyness, StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selectedId: string | null
  onSelect: (id: string) => void
}

// OpenStreetMap tiles remain the key-free default. Only the tile imagery is
// visually subdued in CSS; markers, controls and attribution stay clear.
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function markerIcon(busyness: Busyness, selected: boolean): L.DivIcon {
  return L.divIcon({
    // No user-controlled HTML is inserted into the marker.
    className: `study-pin study-pin--${busyness}${selected ? ' study-pin--selected' : ''}`,
    html: '<span class="study-pin__centre" aria-hidden="true"></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function focusOnMarker(map: L.Map, space: StudySpace) {
  // The compact card overlays the bottom ~105px of the map. Centre the pin
  // within the remaining visible region, rather than the whole map element.
  const zoom = Math.max(15, map.getZoom())
  const markerPoint = map.project([space.coordinates.lat, space.coordinates.lng], zoom)
  const centrePoint = markerPoint.add(L.point(0, 54))
  const centre = map.unproject(centrePoint, zoom)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  map.flyTo(centre, zoom, { animate: !reducedMotion, duration: 0.42 })
}

/** Real building pins, with no request for the user's own location. */
export function CampusMap({ spaces, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)

  // A stable callback ref avoids rebuilding Leaflet when selection changes.
  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: 13,
      maxZoom: 18,
    })
    mapRef.current = map

    map.attributionControl.setPosition('topleft')
    map.attributionControl.setPrefix(false)
    L.tileLayer(TILE_URL, {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)

    spaces.forEach((space) => {
      const marker = L.marker([space.coordinates.lat, space.coordinates.lng], {
        icon: markerIcon(space.busyness, space.id === selectedId),
        title: space.name,
        alt: space.name,
        keyboard: true,
      }).addTo(map)
      const tooltip = document.createElement('span')
      tooltip.textContent = space.name
      marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -10] })
      marker.on('click', () => onSelectRef.current(space.id))
      markersRef.current.set(space.id, marker)
    })

    // The initial state is a whole-campus overview, not an arbitrary first pin.
    const bounds = L.latLngBounds(spaces.map(
      (space) => [space.coordinates.lat, space.coordinates.lng] as L.LatLngTuple,
    ))
    map.fitBounds(bounds, { padding: [36, 48], maxZoom: 15 })

    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => {
      cancelAnimationFrame(frame)
      map.remove()
      markersRef.current.clear()
      mapRef.current = null
    }
    // Static map marker data. List sorting never mutates this array.
  }, [spaces])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    spaces.forEach((space) => {
      markersRef.current.get(space.id)?.setIcon(
        markerIcon(space.busyness, space.id === selectedId),
      )
    })

    if (selectedId) {
      const selected = spaces.find((space) => space.id === selectedId)
      if (selected) focusOnMarker(map, selected)
    }
  }, [selectedId, spaces])

  return (
    <div
      className="campus-map"
      ref={containerRef}
      role="region"
      aria-label="Interactive map of eight UBC Vancouver buildings"
    />
  )
}
