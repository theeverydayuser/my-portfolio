import { useCallback, useEffect, useRef, useState } from 'react'
import Room from './components/room/Room.jsx'
import MenuBar from './components/MenuBar.jsx'
import Window from './components/Window.jsx'
import CaseStudy from './components/CaseStudy.jsx'
import Placeholder from './components/Placeholder.jsx'
import AboutMe from './components/AboutMe.jsx'
import Notes from './components/Notes.jsx'
import Cursor from './components/Cursor.jsx'
import Testimonials from './components/Testimonials.jsx'
import { works } from './data/works.js'
import { useAppearance } from './appearance.js'
import { useRoom } from './room-sync/use-room.js'
import { armAutoplay } from './music/music.js'

// Every openable window, keyed by the id used in the URL hash (e.g. #/board).
const windows = Object.fromEntries([
  ...works.map((w) => [w.id, { title: w.subtitle ? `${w.title} — ${w.subtitle}` : w.title, caseStudy: w.caseStudy }]),
  ['about-me', { title: 'About Me' }],
  ['notes', { title: 'Notes' }],
  ['testimonials', { title: 'Kind words' }],
])

// Windows with their own designed content.
// About Me: ~57% of the screen tall, opening left of centre like the reference; wide enough for one-line details.
Object.assign(windows['about-me'], {
  Content: AboutMe,
  width: 680,
  minWidth: 540,
  maxHeight: '57vh',
  position: { left: '15.4vw', top: '25.4vh' },
  showTitle: false,
})

// Kind words: the recommendations pinned on the board, opening beside it.
Object.assign(windows.testimonials, {
  Content: Testimonials,
  width: 980,
  minWidth: 640,
  height: '78vh',
  position: { left: '14vw', top: '8vh' },
})

// Notes: ~73% of the screen tall at a fixed height, opening right of centre like the reference.
Object.assign(windows.notes, {
  Content: Notes,
  width: 1050,
  minWidth: 860,
  height: '73vh',
  position: { left: '37.9vw', top: '6.7vh' },
})

function idFromHash() {
  const id = window.location.hash.replace(/^#\/?/, '')
  return windows[id] ? id : null
}

// The URL always points at the front window, so it can be shared or reloaded.
function setHash(id) {
  history.replaceState(null, '', window.location.pathname + window.location.search + (id ? `#/${id}` : ''))
}

const bringToFront = (list, id) => [...list.filter((w) => w.id !== id), list.find((w) => w.id === id)]
const patch = (list, id, changes) => list.map((w) => (w.id === id ? { ...w, ...changes } : w))

export default function App() {
  const appearance = useAppearance()
  const room = useRoom()

  // Open windows, back to front. Each remembers the icon it zoomed out of,
  // what to focus when it closes, its step in the cascade, and whether it sits minimised in the dock.
  const [open, setOpen] = useState(() => {
    const id = idFromHash()
    return id ? [{ id, origin: null, returnFocus: null, cascade: 0, minimized: false }] : []
  })
  const cascade = useRef(0)
  // Minimised windows shrink into the monitor.
  const monitorRef = useRef(null)
  // Bumped per window to ask it to close itself (so it plays its zoom-back animation).
  const [closeRequests, setCloseRequests] = useState({})

  // Like macOS: an app that's already open comes to the front (out of the dock if minimised).
  const openWindow = useCallback((id, originEl = null) => {
    const returnFocus = document.activeElement
    setOpen((list) => {
      if (list.some((w) => w.id === id)) return bringToFront(patch(list, id, { minimized: false }), id)
      // Each new window steps down and right from the last; the cascade resets when the desktop is clear.
      const step = list.length ? cascade.current + 1 : 0
      cascade.current = step
      return [...list, { id, origin: originEl, returnFocus, cascade: step, minimized: false }]
    })
  }, [])

  const focusWindow = useCallback((id) => {
    setOpen((list) => (list[list.length - 1]?.id === id ? list : bringToFront(list, id)))
  }, [])

  const minimizeWindow = useCallback((id) => {
    // A minimised window drops behind the others so the next one becomes active.
    setOpen((list) => {
      const target = list.find((w) => w.id === id)
      return target ? [{ ...target, minimized: true }, ...list.filter((w) => w.id !== id)] : list
    })
  }, [])

  const closeWindow = useCallback((id, returnFocus) => {
    setOpen((list) => list.filter((w) => w.id !== id))
    // Hand focus back to whatever opened it once the window has gone.
    requestAnimationFrame(() => returnFocus?.focus?.())
  }, [])

  const requestClose = useCallback((id) => {
    setCloseRequests((r) => ({ ...r, [id]: (r[id] || 0) + 1 }))
  }, [])

  const visible = open.filter((w) => !w.minimized)
  const front = visible[visible.length - 1] ?? null
  const frontId = front?.id ?? null

  // Background music starts with the visitor's first click or key press (see music/music.js).
  useEffect(() => armAutoplay(), [])
  useEffect(() => setHash(frontId), [frontId])

  // A pasted link or edited URL opens (or raises) that window.
  useEffect(() => {
    const onHashChange = () => {
      const id = idFromHash()
      if (id) openWindow(id)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [openWindow])

  return (
    <>
      <MenuBar
        appName={front ? windows[front.id].title : 'Finder'}
        openWindows={open.map((w) => ({ id: w.id, title: windows[w.id].title, minimized: w.minimized }))}
        frontId={frontId}
        appearance={appearance}
        onOpen={openWindow}
        onClose={() => frontId && requestClose(frontId)}
        onMinimize={() => frontId && minimizeWindow(frontId)}
        onTidy={room.tidy}
      />
      <Room room={room} onOpen={openWindow} monitorRef={monitorRef} appearance={appearance} />
      {open.map((w, index) => {
        const content = windows[w.id]
        return (
          <Window
            key={w.id}
            title={content.title}
            width={content.width}
            minWidth={content.minWidth}
            maxHeight={content.maxHeight}
            height={content.height}
            position={content.position}
            showTitle={content.showTitle}
            origin={w.origin}
            minimizeTo={monitorRef}
            minimized={w.minimized}
            closeRequest={closeRequests[w.id]}
            cascade={w.cascade}
            zIndex={10 + index}
            active={w.id === frontId}
            onFocus={() => focusWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
            onClose={() => closeWindow(w.id, w.returnFocus)}
          >
            {content.Content ? (
              <content.Content />
            ) : content.caseStudy ? (
              <CaseStudy title={content.title} {...content.caseStudy} />
            ) : (
              <Placeholder title={content.title} />
            )}
          </Window>
        )
      })}
      <Cursor />
    </>
  )
}
