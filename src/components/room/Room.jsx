import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SKILL_LABELS, SOCIALS } from '../../data/room.js'
import { SOCIAL_ICONS, SOCIAL_SIZE } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { works } from '../../data/works.js'
import { layout, roomSize } from '../../room-art/layout.js'
import RoomCanvas, { ChairCanvas } from './RoomCanvas.jsx'
import Person from './Person.jsx'
import Shelf from './Shelf.jsx'
import Monitor from './Monitor.jsx'
import VisitCounter from './VisitCounter.jsx'
import Opener from './Opener.jsx'
import Props from './Props.jsx'
import MusicPlayer from './MusicPlayer.jsx'
import Tour from './Tour.jsx'
import { pctX, pctY, place } from './scene.js'
import styles from './Room.module.css'

const PHONE = '(max-width: 640px)'
const debug = new URLSearchParams(window.location.search).has('debug')

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/*
  A phone's height with its address bar showing (100svh). It doesn't change while the page
  scrolls, so the phone room fits the screen at all times and never re-lays out mid-scroll.
*/
function smallViewportHeight() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;height:100svh;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const h = probe.getBoundingClientRect().height || window.innerHeight
  probe.remove()
  return Math.min(h, window.innerHeight)
}

function useViewport() {
  const read = () => {
    const phone = window.matchMedia(PHONE).matches
    return { vw: window.innerWidth, vh: phone ? smallViewportHeight() : window.innerHeight, phone }
  }
  const [size, setSize] = useState(read)
  useEffect(() => {
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        setSize((prev) => {
          const next = read()
          // On a phone, only a width change (rotating it) re-lays out the room.
          if (next.phone && prev.phone && next.vw === prev.vw) return prev
          return next
        }),
      )
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return size
}

/*
  The pixel-art studio, the portfolio's home screen. It's drawn in code (src/room-art) for
  the exact screen size: the layout reflows rather than scales, so a wide screen gets a
  wider window and more books per shelf, a tall one more shelves. Phones get a compact room:
  an upright monitor and a single column of books, as tall as the books need, scrolling.
*/
export default function Room({ room, onOpen, monitorRef }) {
  const { vw, vh, phone } = useViewport()
  const size = roomSize(vw, vh, { phone, books: works.length })
  // Only a phone too short for readable books gets a room taller than the screen.
  const scrolls = phone && size.H * size.scale > vh + 1
  return (
    <main className={`${styles.room} ${scrolls ? styles.scrolls : ''}`}>
      <h1 className="visually-hidden">Mide Adeshina — Portfolio</h1>
      <Scene size={size} room={room} onOpen={onOpen} monitorRef={monitorRef} className={phone ? styles.tall : ''} />
    </main>
  )
}

// Moving off a book waits a moment before the monitor goes back, so gliding from one book
// to the next doesn't flash the default screen in between.
const PREVIEW_LINGER_MS = 250

function usePreview() {
  const [work, setWork] = useState(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  // Fetch the preview stills (~10 KB each) once the page is idle, so a hover shows one at once.
  useEffect(() => {
    const warm = () => works.forEach((w) => w.preview && (new Image().src = w.preview.poster))
    const id = window.requestIdleCallback ? requestIdleCallback(warm) : setTimeout(warm, 2000)
    return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id))
  }, [])
  const show = useCallback((next) => {
    clearTimeout(timer.current)
    if (next) setWork(next)
    else timer.current = setTimeout(() => setWork(null), PREVIEW_LINGER_MS)
  }, [])
  return [work, show]
}

// The canvas, and everything clickable placed over it from the same layout.
function Scene({ size, room, onOpen, monitorRef, className = '' }) {
  const { W, H, scale } = size
  const L = useMemo(() => layout(W, H, works.length), [W, H])
  const overlayRef = useRef(null)
  const [preview, setPreview] = usePreview()
  // Touch screens: no hovering a book for its preview, so the monitor plays the works itself.
  const noHover = useMediaQuery('(hover: none)')

  return (
    // Explicit pixel size (not aspect-ratio), so the canvas and the layer of buttons over it are
    // always exactly the same box on every browser.
    <div className={`${styles.scene} ${className}`} style={{ '--s': `${scale}px`, width: W * scale, height: H * scale }}>
      <RoomCanvas L={L} />
      {/* Layers, back to front: the screen's contents, Mide (in front of the screen), the
          chair (hiding Mide's body), then everything clickable. */}
      <div className={styles.overlay}>
        <Monitor ref={monitorRef} L={L} preview={preview} reel={noHover} onOpen={onOpen} />
      </div>
      <div className={styles.overlay}>
        <Person L={L} onOpen={onOpen} />
      </div>
      <ChairCanvas L={L} />
      <div ref={overlayRef} className={styles.overlay}>
        <div className={`${styles.shelfSign} ${L.compact ? styles.signCompact : ''}`} style={place(L.sign, L)} aria-hidden="true">
          <FolderIcon />
          <span>My Works</span>
          {!L.compact && <span className={styles.signArrow}>→</span>}
        </div>
        <VisitCounter visits={room.visits} here={room.here} L={L} />
        <Shelf works={works} L={L} onOpen={onOpen} onPreview={setPreview} />
        {L.portrait && (
          // The portrait is painted in the canvas; this is its click area and "About Me" callout.
          <Opener opens="about" onOpen={onOpen} className={styles.frameHit} style={place({ left: L.portrait.x, top: L.portrait.y, width: L.portrait.w, height: L.portrait.h }, L)} tip={false}>
            <span className={styles.aboutBubble} aria-hidden="true">About Me</span>
          </Opener>
        )}
        {scale >= 2 && <SkillWords L={L} />}
        <Socials L={L} onOpen={onOpen} />
        <MusicPlayer L={L} />
        <Props L={L} overlayRef={overlayRef} room={room} onOpen={onOpen} />
        <Tour L={L} room={room} scale={scale} />
        {debug && <DebugOverlay L={L} />}
      </div>
    </div>
  )
}

// LinkedIn and TikTok tiles, fixed on the top shelf; a click opens the profile (or says "coming soon").
function Socials({ L, onOpen }) {
  return SOCIALS.map((id, i) => {
    const slot = L.socialSlots[i]
    return (
      <Opener
        key={id}
        opens={id}
        onOpen={onOpen}
        className={styles.standing}
        style={{ left: pctX(slot.x, L), top: pctY(slot.y, L), width: pctX(SOCIAL_SIZE.w, L) }}
      >
        <img className={styles.objectArt} src={spriteUrl(`social-${id}`, SOCIAL_SIZE.w, SOCIAL_SIZE.h, SOCIAL_ICONS[id])} width={SOCIAL_SIZE.w} height={SOCIAL_SIZE.h} alt="" draggable="false" />
      </Opener>
    )
  })
}

// Labels on the skill boxes on the top shelf (only when the room is big enough to read them).
function SkillWords({ L }) {
  return L.skillStacks.map((stack) =>
    SKILL_LABELS[stack.id].slice(0, stack.rows).map((label, i) => (
      <span
        key={label}
        className={styles.skillWord}
        style={place({ left: stack.x + 2, top: L.shelf.y - (stack.rows - i) * stack.rowH, width: stack.w - 6, height: stack.rowH - 1 }, L)}
        aria-hidden="true"
      >
        {label}
      </span>
    )),
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 12 10" className={styles.folder} shapeRendering="crispEdges" aria-hidden="true">
      <path d="M0 1h5v1h7v8H0z" fill="#f0a23a" />
      <path d="M1 3h10v6H1z" fill="#1a2140" />
      <path d="M2 4h2v1H2z" fill="#f0a23a" />
    </svg>
  )
}

// ?debug outlines every placement and surface, for checking the layout at any size.
function DebugOverlay({ L }) {
  const boxes = [
    ...L.bookSlots.map((slot, i) => ({ ...slot, label: `book ${i + 1}` })),
    { left: L.screen.x, top: L.screen.y, width: L.screen.w, height: L.screen.h, label: 'screen' },
    { ...L.sign, label: 'sign' },
    { ...L.counter, label: 'counter' },
    ...(L.portrait ? [{ left: L.portrait.x, top: L.portrait.y, width: L.portrait.w, height: L.portrait.h, label: 'portrait' }] : []),
  ]
  return (
    <div className={styles.debug} aria-hidden="true">
      {boxes.map((b) => (
        <span key={b.label} className={styles.debugBox} style={place(b, L)}>{b.label}</span>
      ))}
      {L.surfaces.map((s) => (
        <span key={s.id} className={styles.debugSurface} style={{ left: pctX(s.x1, L), top: pctY(s.y, L), width: pctX(s.x2 - s.x1, L) }}>
          {s.id}
        </span>
      ))}
      <span className={styles.debugInfo}>{`${L.W}×${L.H} · ${L.cols} cols · ${L.bays.length} bays`}</span>
    </div>
  )
}
