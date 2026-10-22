/*
  Local stand-in for the shared room server.

  Positions and the visit count are kept in this browser, and open tabs talk to each other
  over a BroadcastChannel, so two tabs behave like two visitors: one tab sees the other's
  drags live, and the "here now" count goes up.

  The real server (deploy time) implements the same interface:
    loadPositions()          -> { [propId]: { surface, t } }
    countVisit()             -> total visits (counts this visit once per browser session)
    drag(id, { fx, fy })     -> live position while someone drags, as fractions of the room (not saved)
    drop(id, { surface, t }) -> final resting place (saved for every future visitor)
    tidy()                   -> put everything back where it started
    subscribe(listener)      -> listener({ type: 'drag' | 'drop' | 'tidy' | 'presence', ... }); returns unsubscribe
    dispose()
*/
// v2: positions became { surface, t } when the room started being drawn in code.
const POSITIONS_KEY = 'room:positions:v2'
const VISITS_KEY = 'room:visits'
const COUNTED_KEY = 'room:counted'
const HEARTBEAT_MS = 4000
// A visitor not heard from in this long has left.
const STALE_MS = 10000

// Storage can be blocked (private windows, previews); the room still works for this visit.
function read(storage, key, fallback) {
  try {
    const value = storage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Not saved; the change still shows for everyone currently in the room.
  }
}

export function createLocalRoom() {
  const self = Math.random().toString(36).slice(2)
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('room') : null
  const listeners = new Set()
  const seen = new Map()

  const emit = (event) => listeners.forEach((listener) => listener(event))
  const send = (message) => channel?.postMessage({ ...message, from: self })

  const emitPresence = () => {
    const now = Date.now()
    for (const [id, at] of seen) if (now - at > STALE_MS) seen.delete(id)
    emit({ type: 'presence', here: seen.size + 1 })
  }

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (data.from === self) return
      if (data.type === 'here') {
        // Someone new answers back straight away, so both tabs count each other at once.
        if (!seen.has(data.from)) send({ type: 'here' })
        seen.set(data.from, Date.now())
        emitPresence()
      } else if (data.type === 'bye') {
        seen.delete(data.from)
        emitPresence()
      } else {
        emit(data)
      }
    }
  }

  send({ type: 'here' })
  const heartbeat = setInterval(() => {
    send({ type: 'here' })
    emitPresence()
  }, HEARTBEAT_MS)
  const onPageHide = () => send({ type: 'bye' })
  window.addEventListener('pagehide', onPageHide)

  return {
    loadPositions: () => read(localStorage, POSITIONS_KEY, {}),

    countVisit() {
      let visits = read(localStorage, VISITS_KEY, 0)
      if (!read(sessionStorage, COUNTED_KEY, false)) {
        visits += 1
        write(localStorage, VISITS_KEY, visits)
        write(sessionStorage, COUNTED_KEY, true)
      }
      return visits
    },

    drag: (id, pos) => send({ type: 'drag', id, ...pos }),

    drop(id, pos) {
      write(localStorage, POSITIONS_KEY, { ...read(localStorage, POSITIONS_KEY, {}), [id]: pos })
      send({ type: 'drop', id, ...pos })
    },

    tidy() {
      write(localStorage, POSITIONS_KEY, {})
      send({ type: 'tidy' })
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    dispose() {
      clearInterval(heartbeat)
      window.removeEventListener('pagehide', onPageHide)
      send({ type: 'bye' })
      channel?.close()
    },
  }
}
