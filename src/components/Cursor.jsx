import { useEffect, useRef, useState } from 'react'
import { spriteUrl } from '../room-art/to-image.js'
import styles from './Cursor.module.css'

/*
  A big pixel cursor (mouse and trackpad only; touch screens keep theirs), carrying a small
  "My works" tag beside it. The arrow in the tag always points at the works on the shelf
  and nudges that way, like Mide showing the visitor where to go. The tag steps aside over
  the works themselves and anywhere outside the room (an open window, the menu bar).

  It moves every frame, so it's driven straight through the DOM rather than React state.
*/

// One pixel of the art, in CSS px.
const PX = 3
// The guide arrow's pixels, smaller than the cursor's so it sits in the tag's text line.
const GUIDE_PX = 2

const KEY = { X: '#14101c', w: '#ffffff' }
// The guide arrow is solid dark, on the tag's gold.
const GUIDE_KEY = { X: '#1a1020', g: '#1a1020' }

// The pointer, tip at its top-left pixel.
const ARROW = {
  hot: [0, 0],
  rows: [
    'X...........',
    'XX..........',
    'XwX.........',
    'XwwX........',
    'XwwwX.......',
    'XwwwwX......',
    'XwwwwwX.....',
    'XwwwwwwX....',
    'XwwwwwwwX...',
    'XwwwwwwwwX..',
    'XwwwwwXXXXX.',
    'XwwXwwX.....',
    'XwX.XwwX....',
    'XX..XwwX....',
    'X....XwwX...',
    '.....XwwX...',
    '......XX....',
  ],
}

// Over anything clickable: a pointing hand, the fingertip at its hot spot.
const HAND = {
  hot: [5, 0],
  rows: [
    '.....XX.........',
    '....XwwX........',
    '....XwwX........',
    '....XwwX........',
    '....XwwXXX......',
    '....XwwXwwXXX...',
    '....XwwXwwXwwXX.',
    '.XX.XwwXwwXwwXwX',
    'XwwXXwwwwwwwwXwX',
    'XwwwXwwwwwwwwwwX',
    '.XwwXwwwwwwwwwwX',
    '..XwwwwwwwwwwwwX',
    '..XwwwwwwwwwwwX.',
    '...XwwwwwwwwwwX.',
    '....XwwwwwwwwX..',
    '....XwwwwwwwwX..',
    '....XXXXXXXXXX..',
  ],
}

// The guide: an arrow pointing right (it's turned towards the works).
const GUIDE = {
  rows: [
    '......X....',
    '......XX...',
    'XXXXXXXgX..',
    'XggggggggX.',
    'XgggggggggX',
    'XggggggggX.',
    'XXXXXXXgX..',
    '......XX...',
    '......X....',
  ],
}

const art = (name, { rows }, key = KEY) => spriteUrl(`cursor-${name}`, rows[0].length, rows.length, (r) => r.sprite(rows, key, 0, 0))
const size = ({ rows }, px = PX) => ({ width: `${rows[0].length * px}px`, height: `${rows.length * px}px` })

const CLICKABLE = 'a, button, [role="link"], [role="button"], [tabindex]:not([tabindex="-1"])'

function useFinePointer() {
  const query = '(hover: hover) and (pointer: fine)'
  const [fine, setFine] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setFine(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [])
  return fine
}

// The box around every book on screen, or null when there are none.
function worksBox() {
  const rects = [...document.querySelectorAll('[data-work]')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0)
  if (!rects.length) return null
  const left = Math.min(...rects.map((r) => r.left))
  const top = Math.min(...rects.map((r) => r.top))
  const right = Math.max(...rects.map((r) => r.right))
  const bottom = Math.max(...rects.map((r) => r.bottom))
  return { left, top, right, bottom, x: (left + right) / 2, y: (top + bottom) / 2 }
}

export default function Cursor() {
  const fine = useFinePointer()
  const root = useRef(null)
  const pointer = useRef(null)
  const tag = useRef(null)
  const guide = useRef(null)

  useEffect(() => {
    if (!fine) return
    const html = document.documentElement
    html.classList.add(styles.hideNative)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let x = -200
    let y = -200
    let inRoom = false
    let overWork = false
    let hand = null
    let frame = 0

    const setHand = (next) => {
      if (next === hand) return
      hand = next
      const shape = next ? HAND : ARROW
      pointer.current.src = art(next ? 'hand' : 'arrow', shape)
      Object.assign(pointer.current.style, { ...size(shape), left: `${-shape.hot[0] * PX}px`, top: `${-shape.hot[1] * PX}px` })
    }
    setHand(false)

    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
      const target = event.target instanceof Element ? event.target : null
      // (Windows and the menu bar sit outside the room's element.)
      inRoom = Boolean(target?.closest('[data-room]'))
      overWork = Boolean(target?.closest('[data-work]'))
      setHand(Boolean(target?.closest(CLICKABLE)))
      root.current.dataset.shown = ''
    }
    const onLeave = (event) => {
      if (!event.relatedTarget) delete root.current.dataset.shown
    }

    const step = (now) => {
      // Gone (the page is being torn down): stop.
      if (!root.current) return
      root.current.style.transform = `translate(${x}px, ${y}px)`
      const box = inRoom && !overWork ? worksBox() : null
      // Close enough to the books: the tag has done its job.
      const near = box && x > box.left - 24 && x < box.right + 24 && y > box.top - 24 && y < box.bottom + 24
      if (box && !near) {
        const angle = Math.atan2(box.y - y, box.x - x)
        // A small push along the way to go, like a beckoning hand.
        const nudge = reduced ? 0 : (Math.sin(now / 240) + 1) * 2
        guide.current.style.transform = `rotate(${angle}rad) translateX(${nudge}px)`
        tag.current.dataset.shown = ''
      } else {
        delete tag.current.dataset.shown
      }
      frame = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave)
    frame = requestAnimationFrame(step)
    return () => {
      html.classList.remove(styles.hideNative)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onMove)
      document.removeEventListener('pointerout', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [fine])

  if (!fine) return null
  return (
    <div ref={root} className={styles.cursor} aria-hidden="true">
      <span ref={tag} className={styles.tag}>
        <span className={styles.guideBox}>
          <img ref={guide} className={styles.guide} src={art('guide', GUIDE, GUIDE_KEY)} style={size(GUIDE, GUIDE_PX)} alt="" />
        </span>
        My works
      </span>
      <img ref={pointer} alt="" />
    </div>
  )
}
