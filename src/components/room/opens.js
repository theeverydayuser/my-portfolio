import { OPENS } from '../../data/room.js'

export const openerLabel = (opens) => (OPENS[opens].window || OPENS[opens].href ? OPENS[opens].label : `${OPENS[opens].label} · coming soon`)

// Opens what a room object stands for: a window, a link in a new tab, or nothing yet.
export function activate(opens, el, onOpen) {
  const target = OPENS[opens]
  if (target.window) onOpen(target.window, el)
  else if (target.href) window.open(target.href, '_blank', 'noopener,noreferrer')
}
