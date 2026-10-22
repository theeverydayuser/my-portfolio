import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SOCIALS } from '../../data/room.js'
import { APP_ICONS, LAMP_SIZE, SOCIAL_ICONS, SOCIAL_SIZE, drawLamp } from '../../room-art/sprites.js'
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
  the works as a row of spines on a library shelf above a full-width monitor.
*/
export default function Room({ room, onOpen, monitorRef, appearance }) {
  const { vw, vh, phone } = useViewport()
  const size = roomSize(vw, vh, { phone })
  // Only a very short phone gets a room taller than the screen.
  const scrolls = phone && size.H * size.scale > vh + 1
  return (
    <main className={`${styles.room} ${scrolls ? styles.scrolls : ''}`}>
      <h1 className="visually-hidden">Mide Adeshina — Portfolio</h1>
      <Scene size={size} room={room} onOpen={onOpen} monitorRef={monitorRef} appearance={appearance} className={phone ? styles.tall : ''} />
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
function Scene({ size, room, onOpen, monitorRef, appearance, className = '' }) {
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
      <RoomCanvas L={L} day={appearance.day} />
      {/* Layers, back to front: the screen's contents, Mide (in front of the screen), the
          chair (hiding Mide's body), then everything clickable. */}
      <div className={styles.overlay}>
        <Monitor ref={monitorRef} L={L} preview={preview} reel={noHover} onOpen={onOpen} />
      </div>
      <div className={styles.overlay}>
        <Person L={L} onOpen={onOpen} />
      </div>
      <ChairCanvas L={L} day={appearance.day} />
      <div ref={overlayRef} className={styles.overlay}>
        <div className={styles.shelfSign} style={place(L.sign, L)} aria-hidden="true">
          <FolderIcon />
          <span>My Works</span>
          <span className={styles.signArrow}>{L.library ? '↓' : '→'}</span>
        </div>
        <VisitCounter visits={room.visits} here={room.here} L={L} />
        <Lamp L={L} appearance={appearance} />
        <Shelf works={works} L={L} onOpen={onOpen} onPreview={setPreview} />
        {L.portrait && (
          // The portrait is painted in the canvas; this is its click area and "About Me" callout.
          <Opener opens="about" onOpen={onOpen} className={styles.frameHit} style={place({ left: L.portrait.x, top: L.portrait.y, width: L.portrait.w, height: L.portrait.h }, L)} tip={false}>
            <span className={styles.aboutBubble} aria-hidden="true">About Me</span>
          </Opener>
        )}
        <AppNames L={L} />
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

/*
  The day/night switch: the lamp at the end of the top shelf. On is night (with a pool of
  warm light under it), off is day. Its label always shows, so visitors know it's a switch.
*/
function Lamp({ L, appearance }) {
  const on = !appearance.day
  const label = on ? 'Switch off for day' : 'Switch on for night'
  return (
    <button
      type="button"
      className={`${styles.standing} ${styles.opener} ${styles.lamp}`}
      style={{ left: pctX(L.lamp.x, L), top: pctY(L.lamp.y, L), width: pctX(LAMP_SIZE.w, L) }}
      aria-label={label}
      aria-pressed={on}
      onClick={appearance.toggle}
    >
      {on && <span className={styles.lampLight} aria-hidden="true" />}
      <img className={styles.objectArt} src={spriteUrl(`lamp-${on ? 'on' : 'off'}`, LAMP_SIZE.w, LAMP_SIZE.h, (r) => drawLamp(r, on))} width={LAMP_SIZE.w} height={LAMP_SIZE.h} alt="" draggable="false" />
      <span className={`${styles.tip} ${styles.lampTip}`}>{label}</span>
    </button>
  )
}

// The app icons are painted in the room; these name each one when it's hovered (or focused).
function AppNames({ L }) {
  return L.appIcons.map(({ index, x, y, size }) => (
    <span key={index} className={styles.appIcon} style={place({ left: x, top: y, width: size, height: size }, L)} tabIndex={0} role="img" aria-label={APP_ICONS[index].name}>
      <span className={styles.tip}>{APP_ICONS[index].name}</span>
    </span>
  ))
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
    ...(L.freeSpot ? [{ left: L.freeSpot.x, top: L.freeSpot.y, width: L.freeSpot.w, height: L.freeSpot.h, label: 'free spot' }] : []),
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
