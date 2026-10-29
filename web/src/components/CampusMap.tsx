import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Busyness, StudySpace } from '../types'

interface Props {
  spaces: readonly StudySpace[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const UBC_CENTRE: L.LatLngExpression = [49.2652, -123.2515]
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function markerIcon(busyness: Busyness, selected: boolean): L.DivIcon {
  // Static markup; no user-supplied names or report values go into HTML.
  return L.divIcon({
    className: `study-pin study-pin--${busyness}${selected ? ' study-pin--selected' : ''}`,
    html: '<span class="study-pin__centre" aria-hidden="true"></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

/** Real campus pins, without tracking the user's position. */
export function CampusMap({ spaces, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: 14,
      maxZoom: 19,
    }).setView(UBC_CENTRE, 15)
    mapRef.current = map

    // Put attribution above the floating card; keep it visibly on the map.
    map.attributionControl.setPosition('topleft')
    map.attributionControl.setPrefix(false)
    L.tileLayer(TILE_URL, {
      maxZoom: 19,
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

    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => {
      cancelAnimationFrame(frame)
      map.remove()
      markersRef.current.clear()
      mapRef.current = null
    }
    // Stable marker list comes from the static demo dataset; it isn't sorted in place.
  }, [spaces])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    spaces.forEach((space) => {
      markersRef.current.get(space.id)?.setIcon(markerIcon(space.busyness, space.id === selectedId))
    })
    if (!selectedId) return
    const selected = spaces.find((space) => space.id === selectedId)
    if (selected) {
      // Centre slightly south of the marker so it stays visible above the location card.
      map.flyTo(
        [selected.coordinates.lat - 0.00065, selected.coordinates.lng],
        Math.max(16, map.getZoom()),
        { animate: true, duration: 0.45 },
      )
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
