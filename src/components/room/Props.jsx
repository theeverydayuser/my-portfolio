import { useRef, useState } from 'react'
import { PROPS, OPENS } from '../../data/room.js'
import { propSprite } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { activate, openerLabel } from './opens.js'
import { pctX, pctY } from './scene.js'
import { homePlace, toPlace, toPoint } from './prop-place.js'
import styles from './Props.module.css'
import roomStyles from './Room.module.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Moving less than this (room px) between press and release counts as a click, not a drag.
const CLICK_SLOP = 1.5

// The nearest surface at or below a point; the floor catches everything else.
function landingFor(L, x, y) {
  const below = L.surfaces.filter((s) => x >= s.x1 && x <= s.x2 && s.y >= y - 1)
  return below.reduce((best, s) => (s.y < best.y ? s : best), L.surfaces.at(-1))
}

// Fall time grows with the square root of the drop height, like gravity.
const fallMs = (distance) => Math.round(110 + Math.sqrt(Math.max(distance, 0)) * 30)

/*
  Objects visitors can pick up and leave anywhere. Positions are shared: a drop is saved for
  every future visitor, and while someone drags, everyone in the room watches it move.
  A plain click on one that stands for something (the notebooks, the phone) opens it.
*/
export default function Props({ L, overlayRef, room, onOpen }) {
  return PROPS.map((prop) => (
    <Prop
      key={prop.id}
      prop={prop}
      L={L}
      overlayRef={overlayRef}
      place={room.positions[prop.id] ?? homePlace(prop, L)}
      remote={room.remote[prop.id]}
      onDrag={room.drag}
      onDrop={room.drop}
      onOpen={onOpen}
    />
  ))
}

function Prop({ prop, L, overlayRef, place, remote, onDrag, onDrop, onOpen }) {
  const art = propSprite(prop.id)
  const [held, setHeld] = useState(null)
  const [fall, setFall] = useState(null)
  const grab = useRef(null)
  const dragged = useRef(false)
  const frame = useRef(0)
  const resting = toPoint(L, place)

  const toRoom = (event) => {
    const rect = overlayRef.current.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * L.W, y: ((event.clientY - rect.top) / rect.height) * L.H }
  }

  const onPointerDown = (event) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = toRoom(event)
    // Keep the grab point under the pointer, so the object doesn't jump to it.
    grab.current = { dx: point.x - resting.x, dy: point.y - resting.y, start: point }
    dragged.current = false
  }

  const onPointerMove = (event) => {
    if (!grab.current) return
    const point = toRoom(event)
    const { dx, dy, start } = grab.current
    if (!dragged.current && Math.hypot(point.x - start.x, point.y - start.y) < CLICK_SLOP) return
    dragged.current = true
    const next = { x: clamp(point.x - dx, 2, L.W - 2), y: clamp(point.y - dy, art.h, L.H - 1) }
    setFall(null)
    setHeld(next)
    // Share the live position (as fractions of the room) at most once a frame.
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => onDrag(prop.id, { fx: next.x / L.W, fy: next.y / L.H }))
  }

  const release = (pos) => {
    const surface = landingFor(L, pos.x, pos.y)
    setHeld(null)
    // Too many moves too fast: it slides back where it was.
    const accepted = onDrop(prop.id, toPlace(L, surface.id, pos.x))
    setFall({ ms: accepted ? fallMs(surface.y - pos.y) : 260 })
  }

  const onPointerUp = () => {
    if (!grab.current) return
    grab.current = null
    cancelAnimationFrame(frame.current)
    if (dragged.current && held) release(held)
  }

  // Fires after pointerup: only a press that didn't turn into a drag opens anything.
  const onClick = (event) => {
    if (dragged.current) return
    if (prop.opens) activate(prop.opens, event.currentTarget, onOpen)
  }

  // Arrow keys: slide along the surface, or hop to the surface above or below.
  const onKeyDown = (event) => {
    const step = { ArrowLeft: -6, ArrowRight: 6 }[event.key]
    if (step) {
      event.preventDefault()
      release({ x: resting.x + step, y: resting.y - 1 })
      return
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const stacked = L.surfaces.filter((s) => resting.x >= s.x1 && resting.x <= s.x2).sort((a, b) => a.y - b.y)
      const index = stacked.findIndex((s) => s.y === resting.y)
      const next = stacked[clamp(index + (event.key === 'ArrowUp' ? -1 : 1), 0, stacked.length - 1)]
      if (next && next.y !== resting.y) onDrop(prop.id, toPlace(L, next.id, resting.x))
    }
  }

  // Held by me > held by someone else > resting on (or falling onto) its saved spot.
  const shown = held ?? (remote ? { x: remote.fx * L.W, y: remote.fy * L.H } : resting)
  // My drop falls under gravity; someone else's drag glides between their updates.
  const transition = held
    ? undefined
    : remote
      ? 'left 90ms linear, top 90ms linear'
      : fall
        ? `top ${fall.ms}ms cubic-bezier(0.55, 0, 1, 0.45), left ${fall.ms}ms linear`
        : 'top 320ms cubic-bezier(0.55, 0, 1, 0.45), left 200ms ease-out'

  const opensLabel = prop.opens ? `${OPENS[prop.opens].label}. ` : ''

  return (
    <button
      type="button"
      className={`${styles.prop} ${roomStyles.standing} ${held ? styles.held : ''} ${remote ? styles.remote : ''}`}
      style={{
        left: pctX(shown.x, L),
        top: pctY(shown.y, L),
        width: pctX(art.w, L),
        transition,
        // Above the room's own things; the one in a hand rides above everything.
        zIndex: held ? 6 : remote ? 5 : 3,
      }}
      aria-label={`${prop.name}. ${opensLabel}Drag to move it, or use the arrow keys.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <img className={roomStyles.objectArt} src={spriteUrl(prop.id, art.w, art.h, art.draw)} width={art.w} height={art.h} alt="" draggable="false" />
      {prop.opens && !held && !remote && <span className={prop.callout ? roomStyles.aboutBubble : roomStyles.tip}>{openerLabel(prop.opens)}</span>}
    </button>
  )
}
