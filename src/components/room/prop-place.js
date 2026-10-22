import { PROPS } from '../../data/room.js'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Saved positions are { surface, t }: a surface id and how far along it (0–1).
const surfaceOf = (L, id) => L.surfaces.find((s) => s.id === id) ?? L.surfaces.find((s) => s.id === 'desk-back')
export const toPlace = (L, surfaceId, x) => {
  const s = surfaceOf(L, surfaceId)
  return { surface: s.id, t: clamp((x - s.x1) / (s.x2 - s.x1), 0, 1) }
}
// Where a saved { surface, t } sits in this layout. Unknown surfaces fall back to the desk.
export const toPoint = (L, place) => {
  const s = surfaceOf(L, place.surface)
  return { x: s.x1 + place.t * (s.x2 - s.x1), y: s.y }
}

export const homePlace = (prop, L) => {
  const home = prop.home(L)
  return toPlace(L, home.surface, home.x)
}

// Where an object is right now in this layout: moved by someone, or at its home spot.
export function propPoint(L, positions, id) {
  const prop = PROPS.find((p) => p.id === id)
  return toPoint(L, positions[id] ?? homePlace(prop, L))
}
