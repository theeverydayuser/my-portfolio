import { useEffect, useState } from 'react'
import { propPoint } from './prop-place.js'
import { propSprite, TURNTABLE_SIZE } from '../../room-art/sprites.js'
import { pctX, pctY, place } from './scene.js'
import styles from './Tour.module.css'

/*
  Callouts that show visitors around the room.
  - First visit: a five-step tour (works, moving things, music, things that open, the live counter).
  - Later visits: just the "pick a book" callout, with a way to take the tour again.
  - Help › Show Me Around in the menu bar replays the tour (it fires 'room:tour').
  Whether this browser has seen the tour is a per-visitor convenience; storage may fail quietly.
*/
const TOURED_KEY = 'room:toured'
const START_DELAY_MS = 900
// The returning-visitor callout steps aside on its own after a while.
const NUDGE_MS = 14000
// Space between a callout and the thing it points at, in room pixels.
const GAP = 4

const union = (rects) => {
  const left = Math.min(...rects.map((r) => r.left))
  const top = Math.min(...rects.map((r) => r.top))
  const right = Math.max(...rects.map((r) => r.left + r.width))
  const bottom = Math.max(...rects.map((r) => r.top + r.height))
  return { left, top, width: right - left, height: bottom - top }
}

// A standing thing's box from its bottom-centre point and size.
const standingRect = ({ x, y }, { w, h }) => ({ left: x - w / 2, top: y - h, width: w, height: h })

const STEPS = [
  {
    id: 'works',
    text: 'My work lives on these shelves. Pick a book to open a case study.',
    side: 'left',
    target: (L) => union(L.bookSlots),
  },
  {
    id: 'move',
    text: 'Pick things up and move them around. Whatever you leave, the next visitor finds.',
    side: 'top',
    target: (L, room) => standingRect(propPoint(L, room.positions, 'mug'), propSprite('mug')),
  },
  {
    id: 'music',
    text: 'The music comes from the record player. Click it to stop or start.',
    side: 'top',
    target: (L) => standingRect(L.player, TURNTABLE_SIZE),
  },
  {
    id: 'opens',
    text: 'Click my portrait to meet me. The notebooks and the phone open more.',
    side: 'bottom',
    target: (L) => {
      const p = L.portrait ?? { x: L.monitor.x, y: L.monitor.y, w: L.monitor.w, h: L.monitor.h }
      return { left: p.x, top: p.y, width: p.w, height: p.h }
    },
  },
  {
    id: 'live',
    text: 'Visits are counted here. When others are in the room, you see them, and their mess, live.',
    side: 'left',
    target: (L) => L.counter,
  },
]

function toured() {
  try {
    return localStorage.getItem(TOURED_KEY) === '1'
  } catch {
    return false
  }
}

function markToured() {
  try {
    localStorage.setItem(TOURED_KEY, '1')
  } catch {
    // Not remembered; the visitor just sees the tour again next time.
  }
}

export default function Tour({ L, room, scale }) {
  // null (hidden) | 'tour' | 'nudge'
  const [mode, setMode] = useState(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setMode(toured() ? 'nudge' : 'tour'), START_DELAY_MS)
    const replay = () => {
      setIndex(0)
      setMode('tour')
    }
    window.addEventListener('room:tour', replay)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('room:tour', replay)
    }
  }, [])

  useEffect(() => {
    if (mode !== 'nudge') return
    const timer = setTimeout(() => setMode(null), NUDGE_MS)
    return () => clearTimeout(timer)
  }, [mode])

  if (!mode) return null

  const finish = () => {
    markToured()
    setMode(null)
  }
  const last = mode === 'nudge' || index === STEPS.length - 1
  const step = STEPS[mode === 'nudge' ? 0 : index]

  return (
    <Callout L={L} scale={scale} step={step} rect={step.target(L, room)} onEscape={finish}>
      {mode === 'tour' && <span className={styles.count}>{index + 1} / {STEPS.length}</span>}
      {mode === 'nudge' ? (
        <>
          <button type="button" className={styles.secondary} onClick={() => setMode('tour')}>
            Show me around
          </button>
          <button type="button" className={styles.primary} onClick={finish}>
            Got it
          </button>
        </>
      ) : (
        <>
          {!last && (
            <button type="button" className={styles.secondary} onClick={finish}>
              Skip
            </button>
          )}
          <button type="button" className={styles.primary} onClick={last ? finish : () => setIndex((i) => i + 1)}>
            {last ? 'Got it' : 'Next'}
          </button>
        </>
      )}
    </Callout>
  )
}

/*
  A pixel speech bubble beside `rect` (room px) on `side`, with a pulsing glow on the target.
  Bubbles above or below are kept inside the room; the arrow still points at the target.
*/
// Room a bubble needs, in CSS px: its height, plus the menu bar along the top of the screen.
const BUBBLE = { h: 150, menuBar: 34, edge: 8 }
// The bubble's width (CSS px) on this screen; matches .callout's min(270px, 62vw).
const bubbleWidth = (L, scale) => Math.min(270, L.W * scale * 0.62)

/*
  The side a bubble goes on: the step's preferred side, unless the target (which visitors may
  have moved, e.g. the mug onto the top shelf) leaves no room there; then the other side.
*/
function sideFor(preferred, rect, L, scale) {
  const above = rect.top * scale - BUBBLE.menuBar
  const below = (L.H - rect.top - rect.height) * scale
  if (preferred === 'left' && rect.left * scale < bubbleWidth(L, scale) + BUBBLE.edge + 10) return above > below ? 'top' : 'bottom'
  if (preferred === 'top' && above < BUBBLE.h) return 'bottom'
  if (preferred === 'bottom' && below < BUBBLE.h) return 'top'
  return preferred
}

function Callout({ L, scale, step, rect, onEscape, children }) {
  const side = sideFor(step.side, rect, L, scale)
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  let anchor
  if (side === 'left') anchor = { x: rect.left - GAP, y: cy }
  else if (side === 'top') anchor = { x: cx, y: rect.top - GAP }
  else anchor = { x: cx, y: rect.top + rect.height + GAP }
  // Keep the bubble inside the room (and clear of the menu bar); the pointer makes up the difference.
  const half = (bubbleWidth(L, scale) / 2 + BUBBLE.edge) / scale
  const shift = side === 'left' ? 0 : Math.min(Math.max(anchor.x, half), L.W - half) - anchor.x
  const shiftY = side === 'left' ? Math.min(Math.max(anchor.y, L.H * 0.22), L.H * 0.8) - anchor.y : 0

  return (
    <>
      <span className={styles.glow} style={place({ left: rect.left - 1, top: rect.top - 1, width: rect.width + 2, height: rect.height + 2 }, L)} aria-hidden="true" />
      <div
        key={step.id}
        className={`${styles.callout} ${styles[side]}`}
        style={{
          left: pctX(anchor.x + shift, L),
          top: pctY(anchor.y + shiftY, L),
          '--arrow-shift': `calc(${-shift} * var(--s))`,
          '--arrow-shift-y': `calc(${-shiftY} * var(--s))`,
        }}
        role="dialog"
        aria-label="Room tips"
        onKeyDown={(event) => event.key === 'Escape' && onEscape()}
      >
        <p className={styles.text} aria-live="polite">
          {step.text}
        </p>
        <div className={styles.actions}>{children}</div>
      </div>
    </>
  )
}
