import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Busyness, StartingPoint, StudySpace } from '../types'
import { MAP_MARKER_ANCHOR, MAP_MARKER_SIZE, mapMarkerSvg } from '../lib/mapMarkerIcons'

interface Props {
  spaces: readonly StudySpace[]
  origin: StartingPoint | null
  originFocusRequest: number
  selectedId: string | null
  onSelect: (id: string) => void
}

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

function markerIcon(busyness: Busyness, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: `study-pin study-pin--${busyness}${selected ? ' study-pin--selected' : ''}`,
    html: mapMarkerSvg(busyness),
    iconSize: [MAP_MARKER_SIZE, MAP_MARKER_SIZE],
    iconAnchor: [MAP_MARKER_ANCHOR, MAP_MARKER_ANCHOR],
  })
}

function focusOnMarker(map: L.Map, space: StudySpace) {
  const zoom = Math.max(15, map.getZoom())
  const markerPoint = map.project([space.coordinates.lat, space.coordinates.lng], zoom)
  // Shift the centre down by half the compact detail card's height.
  const centrePoint = markerPoint.add(L.point(0, 54))
  const centre = map.unproject(centrePoint, zoom)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  map.flyTo(centre, zoom, { animate: !reducedMotion, duration: 0.42 })
}

/**
 * Initialise Leaflet exactly once per visible map. Report polling updates markers
 * without resetting the user's pan/zoom context every 30 seconds.
 */
export function CampusMap({ spaces, origin, originFocusRequest, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const originMarkerRef = useRef<L.CircleMarker | null>(null)
  const lastOriginFocusRequestRef = useRef(0)
  const onSelectRef = useRef(onSelect)
  const spacesRef = useRef(spaces)
  spacesRef.current = spaces

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

    const initial = spacesRef.current
    if (initial.length) {
      const bounds = L.latLngBounds(initial.map(
        (space) => [space.coordinates.lat, space.coordinates.lng] as L.LatLngTuple,
      ))
      map.fitBounds(bounds, { padding: [36, 48], maxZoom: 15 })
    } else {
      map.setView([49.2652, -123.2515], 15)
    }

    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => {
      cancelAnimationFrame(frame)
      map.remove()
      markersRef.current.clear()
      originMarkerRef.current = null
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const seen = new Set<string>()

    for (const space of spaces) {
      seen.add(space.id)
      let marker = markersRef.current.get(space.id)
      if (!marker) {
        marker = L.marker([space.coordinates.lat, space.coordinates.lng], {
          icon: markerIcon(space.busyness, space.id === selectedId),
          zIndexOffset: space.id === selectedId ? 1000 : 0,
          title: space.name,
          alt: space.name,
          keyboard: true,
        }).addTo(map)
        const tooltip = document.createElement('span')
        tooltip.textContent = space.name
        marker.bindTooltip(tooltip, { direction: 'top', offset: [0, -10] })
        marker.on('click', () => onSelectRef.current(space.id))
        markersRef.current.set(space.id, marker)
      } else {
        marker.setLatLng([space.coordinates.lat, space.coordinates.lng])
      }
      marker.setIcon(markerIcon(space.busyness, space.id === selectedId))
      marker.setZIndexOffset(space.id === selectedId ? 1000 : 0)
    }

    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }
  }, [spaces, selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!origin) {
      originMarkerRef.current?.remove()
      originMarkerRef.current = null
      return
    }

    const location: L.LatLngExpression = [origin.coordinates.lat, origin.coordinates.lng]
    if (!originMarkerRef.current) {
      originMarkerRef.current = L.circleMarker(location, {
        radius: 7, weight: 3, color: '#fff',
        fillColor: '#5075a5', fillOpacity: 1, opacity: 1,
        bubblingMouseEvents: false,
      }).addTo(map)
      originMarkerRef.current.bringToFront()
    } else {
      originMarkerRef.current.setLatLng(location)
    }
    originMarkerRef.current.unbindTooltip()
    originMarkerRef.current.bindTooltip(
      origin.source === 'gps' ? 'My location (approximate)' : `Starting point: ${origin.label}`,
      { direction: 'top', offset: [0, -8] },
    )
  }, [origin])

  useEffect(() => {
    if (originFocusRequest === lastOriginFocusRequestRef.current) return
    lastOriginFocusRequestRef.current = originFocusRequest
    const map = mapRef.current
    if (!map || !origin) return

    const zoom = Math.max(16, map.getZoom())
    const point = map.project([origin.coordinates.lat, origin.coordinates.lng], zoom)
    // Position the starting point above the selection card if one is open.
    const centre = map.unproject(point.add(L.point(0, selectedId ? 54 : 0)), zoom)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    map.flyTo(centre, zoom, { animate: !reducedMotion, duration: 0.42 })
  }, [originFocusRequest, origin, selectedId])

  useEffect(() => {
    const map = mapRef.current
    const selected = spacesRef.current.find((space) => space.id === selectedId)
    if (map && selected) focusOnMarker(map, selected)
    // Only recenter for an actual selection; report updates must not move the map.
  }, [selectedId])

  return (
    <div
      className="campus-map"
      ref={containerRef}
      role="region"
      aria-label="Interactive map of UBC Vancouver study-space buildings"
    />
  )
}
