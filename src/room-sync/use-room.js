import { useCallback, useEffect, useRef, useState } from 'react'
import { createLocalRoom } from './local-room.js'
import { PROPS } from '../data/room.js'

// One visitor can't spam the room: at most this many drops a minute.
const DROPS_PER_MINUTE = 20

const KNOWN = new Set(PROPS.map((p) => p.id))
const isFraction = (n) => Number.isFinite(n) && n >= 0 && n <= 1

/*
  Positions are stored per object as { surface, t }: which surface it rests on and how far
  along it (0–1), so a mess made on a laptop looks the same on a phone. Saved positions
  come from other visitors, so only known objects with well-formed values are accepted.
*/
function sanitize(saved) {
  const clean = {}
  for (const [id, pos] of Object.entries(saved ?? {})) {
    if (KNOWN.has(id) && typeof pos?.surface === 'string' && pos.surface.length < 24 && isFraction(pos.t)) {
      clean[id] = { surface: pos.surface, t: pos.t }
    }
  }
  return clean
}

// While dragging, positions travel as fractions of the room's width and height.
const sanitizeLive = (pos) => (isFraction(pos?.fx) && isFraction(pos?.fy) ? { fx: pos.fx, fy: pos.fy } : null)

/*
  The shared room: where every movable object sits, which ones another visitor is dragging
  right now, how many people are here, and the all-time visit count.
*/
export function useRoom() {
  const roomRef = useRef(null)
  const recentDrops = useRef([])
  // Only objects someone has moved; the rest sit at their home spot for the current layout.
  const [positions, setPositions] = useState({})
  // Objects someone else is dragging at this moment, so they move live on this screen too.
  const [remote, setRemote] = useState({})
  const [here, setHere] = useState(1)
  const [visits, setVisits] = useState(null)

  useEffect(() => {
    const room = createLocalRoom()
    roomRef.current = room
    setPositions((current) => ({ ...current, ...sanitize(room.loadPositions()) }))
    setVisits(room.countVisit())

    const unsubscribe = room.subscribe((event) => {
      if (event.type === 'presence') return setHere(event.here)
      if (event.type === 'tidy') {
        setRemote({})
        return setPositions({})
      }
      if (!KNOWN.has(event.id)) return
      if (event.type === 'drag') {
        const live = sanitizeLive(event)
        if (live) setRemote((r) => ({ ...r, [event.id]: live }))
      }
      if (event.type === 'drop') {
        const pos = sanitize({ [event.id]: event })[event.id]
        if (!pos) return
        setRemote(({ [event.id]: _, ...rest }) => rest)
        setPositions((p) => ({ ...p, [event.id]: pos }))
      }
    })

    return () => {
      unsubscribe()
      room.dispose()
    }
  }, [])

  const drag = useCallback((id, pos) => roomRef.current?.drag(id, pos), [])

  // Returns false when this visitor has dropped too much too fast; the object goes back.
  const drop = useCallback((id, pos) => {
    const now = Date.now()
    recentDrops.current = recentDrops.current.filter((t) => now - t < 60_000)
    if (recentDrops.current.length >= DROPS_PER_MINUTE) return false
    recentDrops.current.push(now)
    setPositions((p) => ({ ...p, [id]: pos }))
    roomRef.current?.drop(id, pos)
    return true
  }, [])

  const tidy = useCallback(() => {
    setPositions({})
    roomRef.current?.tidy()
  }, [])

  return { positions, remote, here, visits, drag, drop, tidy }
}
