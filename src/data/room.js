/*
  What's in the room and what it does. Where things go is worked out per screen size by
  src/room-art/layout.js; this file only says what exists and where it starts.
*/
const LINKEDIN = 'https://www.linkedin.com/in/ademidesamuel/'

// Things in the room that open something: a desktop window, a link, or nothing yet ("coming soon").
export const OPENS = {
  about: { label: 'About Me', window: 'about-me' },
  notes: { label: 'Notes', window: 'notes' },
  linkedin: { label: 'LinkedIn', href: LINKEDIN },
  tiktok: { label: 'TikTok' },
  resume: { label: 'Resume', href: '/assets/resume/Adeshina-Mide-Otutuloro-CV.pdf' },
}

// The social tiles on the top shelf: fixed in place (not movable), each opens its profile.
export const SOCIALS = ['linkedin', 'tiktok']

/*
  Objects visitors can pick up and leave anywhere; the mess is saved for the next visitor.
  `home(L)` is where each starts, from the room's layout: a surface and an x on it.
  Phones (L.compact) have a narrow desk, so some things start elsewhere there.
  A click (without dragging) on one with `opens` opens it; `callout: true` keeps its label up
  as a bubble (like About Me) instead of only on hover.
*/
const right = (L) => L.monitor.x + L.monitor.w
const middle = (L) => L.monitor.x + (L.monitor.w >> 1)

export const PROPS = [
  // On the top shelf, at the layout's spots for them.
  { id: 'figure', name: 'Figure', home: (L) => ({ surface: 'shelf-top', x: L.shelfAt(L.spots.figure) }) },
  { id: 'globe', name: 'Globe', home: (L) => ({ surface: 'shelf-top', x: L.shelfAt(L.spots.globe) }) },
  // On the desk.
  { id: 'pencil-cup', name: 'Pencil cup', home: (L) => ({ surface: 'desk-back', x: L.compact ? right(L) - 30 : L.monitor.x + 10 }) },
  { id: 'mug', name: 'Mug', home: (L) => ({ surface: 'desk-back', x: L.compact ? right(L) - 16 : L.monitor.x + 25 }) },
  { id: 'phone-stand', name: 'Phone', opens: 'linkedin', home: (L) => ({ surface: 'desk-back', x: L.compact ? right(L) - 1 : L.caseX - 4 }) },
  { id: 'notebooks', name: 'Notebooks', opens: 'notes', callout: true, home: (L) => ({ surface: 'desk-front', x: L.boardW + (L.compact ? 14 : 22) }) },
  { id: 'note-yellow', name: 'Résumé note', opens: 'resume', home: (L) => ({ surface: 'desk-front', x: L.compact ? L.boardW + 42 : L.caseX + 20 }) },
  { id: 'headset', name: 'Headphones', home: (L) => ({ surface: 'desk-front', x: L.compact ? L.W - 12 : middle(L) - 52 }) },
  { id: 'camera', name: 'Camera', home: (L) => (L.compact ? { surface: 'desk-back', x: right(L) - 46 } : { surface: 'desk-back', x: middle(L) - 30 }) },
  // The monitor spans the wall, so these sit on the front of the desk, right of the mouse
  // (on phones, on the floor right of the chair).
  { id: 'tower', name: 'Computer', home: (L) => (L.compact ? { surface: 'floor', x: L.W - 34 } : { surface: 'desk-front', x: middle(L) + 66 }) },
  { id: 'speaker', name: 'Speaker', home: (L) => (L.compact ? { surface: 'floor', x: L.W - 16 } : { surface: 'desk-front', x: middle(L) + 80 }) },
  { id: 'note-blue', name: 'Sticky note', home: (L) => (L.compact ? { surface: 'floor', x: L.W - 8 } : { surface: 'desk-front', x: L.boardW + 44 }) },
]
