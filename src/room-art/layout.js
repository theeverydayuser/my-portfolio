/*
  Where everything in the room goes, worked out from the room's size in pixels (W × H).

  The room is pixel art on a grid about 384 × 256 at its reference size. It is never just
  stretched: a wider screen gets a wider window and more wall, a very wide one a fourth
  column of books; a taller screen gets more bookcase bays. Everything hangs off three
  anchors: the window on the left, the bookcase on the right, the desk along the bottom.

  Phones get a compact room (W ≤ COMPACT_W): an upright monitor with Mide's portrait above
  it (stacked from the ceiling down), and a single column of larger books beside them. The room is as tall as the books
  need, and the page scrolls.

  The renderer (draw-room.js) and the page's clickable layer both read this, so the art
  and the buttons on it can't drift apart.
*/
export const REFERENCE = { w: 384, h: 256 }
export const MIN = { w: 300, h: 220 }
const COMPACT_W = 240
// The phone room's width in room pixels: big enough pixels to read, room for one book column.
const PHONE_W = 210

const BOOK = { w: 26, h: 31 }
const BAY = 36
// Phone book bays share whatever height the screen has, between these sizes.
const BAY_COMPACT = { min: 24, max: 40 }
// Below the desk on phones: just the top of the chair, so the room fits one screen.
const UNDER_DESK = { compact: 60, wide: 84 }
const compactBook = (bay) => ({ h: bay - 4, w: Math.round((bay - 4) * 0.83) })
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// The bookcase's top bay (sign + visit counter), then its book bays.
const signBayFor = (compact, beamH) => ({ y: beamH - 8, h: compact ? 30 : 22 })
const firstBayFor = (compact, beamH) => {
  const bay = signBayFor(compact, beamH)
  return bay.y + bay.h + 3
}

export function layout(W, H, books = 9) {
  const compact = W <= COMPACT_W
  const beamH = 12
  // Vertical: the desk keeps its distance from the bottom; extra height goes to the wall above.
  const deskY = H - (compact ? UNDER_DESK.compact : UNDER_DESK.wide)

  // Bookcase: columns by width, bays by height.
  // Phones: the column of books shares the height between the sign and the desk.
  const bay = compact
    ? Math.min(BAY_COMPACT.max, Math.max(BAY_COMPACT.min, Math.floor((deskY - 24 - firstBayFor(true, beamH)) / Math.max(books, 1))))
    : BAY
  const book = compact ? compactBook(bay) : BOOK
  const cols = compact ? 1 : W >= 560 ? 4 : W >= 340 ? 3 : 2
  const caseW = cols * (book.w + 4) + 10
  const caseX = W - caseW
  const caseInner = { x: caseX + 6, w: caseW - 10 }
  const signBay = signBayFor(compact, beamH)
  const firstBay = firstBayFor(compact, beamH)
  const lastFloor = deskY - 24
  // Phones: exactly one bay per work, so a change in height (the address bar sliding away
  // as the page scrolls) can never move the books; it only lengthens the monitor.
  const bayCount = compact ? Math.max(2, books) : Math.max(2, Math.floor((lastFloor - firstBay) / bay))
  const bays = Array.from({ length: bayCount }, (_, i) => {
    const floor = firstBay + (i + 1) * bay - 3
    // The lowest bay keeps one name on every screen, so things left there stay there.
    const id = i === bayCount - 1 ? 'bay-low' : `bay-${i + 1}`
    return { id, top: floor - bay + 3, floor, x1: caseInner.x, x2: caseInner.x + caseInner.w }
  })
  // Books fill every bay but the lowest, which is left for things visitors put there,
  // unless the works don't fit without it.
  const bookBays = (bays.length - 1) * cols >= books ? bays.slice(0, -1) : bays
  const gap = (caseInner.w - cols * book.w) / (cols + 1)
  const bookSlots = bookBays.flatMap((b) =>
    Array.from({ length: cols }, (_, c) => ({
      left: Math.round(caseInner.x + gap + c * (book.w + gap)),
      top: b.floor - book.h,
      width: book.w,
      height: book.h,
    })),
  )

  // Window: grows with spare width, so wide screens see more of the city.
  const windowW = W >= REFERENCE.w ? clamp(22 + (W - REFERENCE.w) * 0.45, 22, 150) : clamp(22 - (REFERENCE.w - W) * 0.3, 12, 22)

  // The wall between window and bookcase.
  const wall = { x1: windowW, x2: caseX }
  const wallW = wall.x2 - wall.x1

  const { monitor, portrait, topShelfY, midShelf = null } = compact ? stackUpright(wall, deskY, beamH) : besideWide(wall, wallW, caseX, deskY)
  const screen = { x: monitor.x + 3, y: monitor.y + 3, w: monitor.w - 6, h: monitor.h - 7 }
  const shelf = { x1: wall.x1 + 14, x2: caseX - 10, y: topShelfY }
  const shelfW = shelf.x2 - shelf.x1

  // Label boxes and book spines on the top shelf, as in the reference (no room on phones).
  const skillStacks = compact
    ? []
    : [
        { id: 'skills-craft', x: Math.round(shelf.x1 + shelfW * 0.08), w: 46, rows: 4, rowH: 6 },
        { id: 'skills-stack', x: Math.round(shelf.x1 + shelfW * 0.47), w: 38, rows: 5, rowH: 5 },
      ]
  const spineRuns = compact ? [] : [[0.3, 0.43]]

  const lightBar = compact
    ? { x: monitor.x + Math.round(monitor.w * 0.2), y: monitor.y - 6, w: Math.round(monitor.w * 0.6) }
    : { x: monitor.x + 32, y: monitor.y - 6, w: monitor.w - 64 }
  const keyboardW = Math.min(76, Math.round(monitor.w * 0.55))

  // The person at the desk: centred on the chair (as drawChair places it), shoulders just
  // above the chair's back, so the head sits in front of the monitor's lower edge.
  const person = { x: monitor.x + (monitor.w >> 1) + 8, y: deskY + 30 }

  // The record player at the foot of the bookcase, on the desk.
  const player = { x: caseX + (compact ? 22 : 24), y: deskY }

  // Social tiles and the shelf's other things start at these fractions along the top shelf.
  const spots = compact ? { figure: 0.12, linkedin: 0.32, tiktok: 0.5, globe: 0.72 } : { figure: 0.45, linkedin: 0.69, tiktok: 0.79, globe: 0.885 }
  const onShelf = (f) => Math.round(shelf.x1 + shelfW * f)
  const socialSlots = [spots.linkedin, spots.tiktok].map((f) => ({ x: onShelf(f), y: topShelfY }))

  // Tall rooms get a second shelf higher up, halfway between the beam and the top shelf.
  const highShelfY = topShelfY - beamH > (compact ? 80 : 110) ? Math.round(beamH + (topShelfY - beamH) * 0.5) : null
  const highShelf = highShelfY ? { x1: shelf.x1, x2: shelf.x2, y: highShelfY } : null

  const surfaces = [
    ...(highShelf ? [{ id: 'shelf-high', y: highShelfY, x1: shelf.x1, x2: shelf.x2 }] : []),
    { id: 'shelf-top', y: topShelfY, x1: shelf.x1, x2: shelf.x2 },
    ...(midShelf ? [{ id: 'shelf-mid', y: midShelf.y, x1: midShelf.x1, x2: midShelf.x2 }] : []),
    ...bays.map(({ id, floor, x1, x2 }) => ({ id, y: floor, x1, x2 })),
    { id: 'desk-back', y: deskY, x1: windowW - 2, x2: W },
    { id: 'desk-front', y: deskY + 22, x1: 0, x2: W },
    { id: 'floor', y: H - 1, x1: 0, x2: W },
  ]

  const signH = compact ? 20 : 15
  return {
    W,
    H,
    compact,
    beamH,
    deskY,
    windowW,
    wall,
    shelf,
    shelfAt: onShelf,
    spots,
    caseX,
    caseW,
    cols,
    bays,
    bookSlots,
    sign: { left: caseInner.x + 1, top: signBay.y + 3, width: caseInner.w - 2, height: signH },
    counter: compact
      ? { left: caseInner.x + 1, top: signBay.y + 3 + signH + 1, width: caseInner.w - 2, height: 7 }
      : { left: caseX + caseW - 46, top: signBay.y + 3 + 15 + 1, width: 40, height: 7 },
    monitor,
    screen,
    lightBar,
    keyboardW,
    portrait,
    skillStacks,
    spineRuns,
    socialSlots,
    player,
    person,
    highShelf,
    midShelf,
    surfaces,
  }
}

/*
  Laptops and desktops: the portrait fills the wall's left column, standing on the desk
  behind the plant, and an ultrawide monitor (2:1 at most) takes the rest of the wall
  under the shelf, leaving room for the light bar on top.
*/
function besideWide(wall, wallW, caseX, deskY) {
  const topShelfY = deskY - 127
  const portrait = placePortrait({ x1: wall.x1 + 8, x2: wall.x1 + 8 + Math.min(64, Math.round(wallW * 0.32)), top: topShelfY + 12, bottom: deskY - 1 })
  const x1 = portrait ? portrait.x + portrait.w + 10 : wall.x1 + 16
  const w = caseX - 12 - x1
  const h = Math.min(Math.round(w * 0.5), deskY - 8 - (topShelfY + 22))
  return { topShelfY, portrait, monitor: { x: x1, y: deskY - 8 - h, w, h } }
}

/*
  Phones: stacked from the ceiling down, so nothing is wasted above the shelf and the monitor
  sits high on the first screen. The top shelf hangs just under the beam, the portrait below
  it, and an upright monitor takes everything from there down to the desk.
*/
function stackUpright(wall, deskY, beamH) {
  const topShelfY = beamH + 30
  const box = { x1: wall.x1 + 8, x2: wall.x2 - 8, top: topShelfY + 12 }
  const portrait = placePortrait({ ...box, bottom: box.top + 76 }) ?? placePortrait({ ...box, bottom: box.top + 52 })
  const w = wall.x2 - wall.x1 - 20
  const below = (portrait ? portrait.y + portrait.h : topShelfY + 12) + 14
  // A monitor much taller than 3:2 looks stretched; when there's that much height, a small
  // shelf goes between the portrait and the monitor instead.
  const tall = deskY - 8 - below > w * MAX_UPRIGHT + 30
  const midShelf = tall ? { x1: wall.x1 + 14, x2: wall.x2 - 10, y: below + 16 } : null
  const y = midShelf ? midShelf.y + 16 : below
  const monitor = { x: wall.x1 + 10, y, w, h: deskY - 8 - y }
  return { monitor, portrait, topShelfY, midShelf }
}
// The upright monitor's height, at most, as a multiple of its width.
const MAX_UPRIGHT = 1.5

// Portrait sizes, largest first: the picture (public/assets/room/mide-portrait-<w>.png) plus a 2px frame.
const PORTRAITS = [
  { w: 60, h: 72 },
  { w: 40, h: 48 },
]

function placePortrait(box) {
  const size = PORTRAITS.find((p) => p.w + 4 <= box.x2 - box.x1 && p.h + 4 <= box.bottom - box.top)
  if (!size) return null
  const w = size.w + 4
  const h = size.h + 4
  return { x: Math.round(box.x1 + (box.x2 - box.x1 - w) / 2), y: box.bottom - h, w, h, art: size, src: `/assets/room/mide-portrait-${size.w}.png` }
}

/*
  The room's pixel size for a screen of vw × vh CSS px. `scale` is CSS px per room pixel.
  Larger screens: pixels as big as possible while the room stays at least the reference
  height and MIN width, so a wide screen gets a wider room and an upright one a taller room.
  Phones: a fixed-width compact room that fits the screen's height (books shrink to share it).
*/
export function roomSize(vw, vh, { phone = false, books = 9 } = {}) {
  if (phone) {
    const scale = vw / PHONE_W
    // The room fits the screen; only a very short one (books would be unreadably small) scrolls.
    const booksNeed = firstBayFor(true, 12) + books * BAY_COMPACT.min + 24 + UNDER_DESK.compact
    return { W: PHONE_W, H: Math.max(Math.round(vh / scale), booksNeed), scale }
  }
  const scale = Math.min(vw / MIN.w, vh / REFERENCE.h)
  return { W: Math.round(vw / scale), H: Math.round(vh / scale), scale }
}
