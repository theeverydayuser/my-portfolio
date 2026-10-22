/*
  Where everything in the room goes, worked out from the room's size in pixels (W × H).

  The room is pixel art on a grid about 384 × 256 at its reference size. It is never just
  stretched: a wider screen gets a wider window and more wall, a very wide one a fourth
  column of books; a taller screen gets more bookcase bays. Everything hangs off three
  anchors: the window on the left, the bookcase on the right, the desk along the bottom.

  On larger screens the left column (windowW wide, where a window once was) holds Mide's
  portrait, full height from the beam to the desk.

  Phones get a compact room (W ≤ COMPACT_W), stacked from the ceiling down: the top shelf,
  the works standing as a row of spines on a library shelf, then a full-width monitor. No
  bookcase and no portrait; a shelf of app icons sits between the library and the monitor.
  The room fits the screen (a very short one scrolls).

  The renderer (draw-room.js) and the page's clickable layer both read this, so the art
  and the buttons on it can't drift apart.
*/
import { APP_ICONS, SOCIAL_SIZE } from './sprites.js'

export const REFERENCE = { w: 384, h: 256 }
export const MIN = { w: 300, h: 220 }
const COMPACT_W = 240
// The phone room's width in room pixels: big enough pixels to read, room for one book column.
const PHONE_W = 210

const BOOK = { w: 26, h: 31 }
const BAY = 36
// Below the desk on phones: just the top of the chair, so the room fits one screen.
const UNDER_DESK = { compact: 60, wide: 84 }
// The phone's library shelf: the sign row above it, then spines up to bookH tall, each
// a little shorter or taller (drop, in room px) so the row looks like real books.
const LIBRARY = { signH: 11, bookH: 58, spineW: { min: 12, max: 18 }, drop: [0, 4, 1, 6, 2, 0, 5, 3, 1] }
// The "My Resume" plaque's width, in room pixels, where there's room for it.
const PLAQUE_W = 52
// The shortest phone room that still gets a usable monitor; shorter screens scroll.
const PHONE_MIN_H = 340
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// The bookcase's top bay (sign + visit counter), then its book bays.
const SIGN_BAY_H = 22

export function layout(W, H, books = 9) {
  const compact = W <= COMPACT_W
  const beamH = 12
  // Vertical: the desk keeps its distance from the bottom; extra height goes to the wall above.
  const deskY = H - (compact ? UNDER_DESK.compact : UNDER_DESK.wide)

  // Bookcase (not on phones): columns by width, bays by height.
  const cols = compact ? 0 : W >= 560 ? 4 : W >= 340 ? 3 : 2
  const caseW = compact ? 0 : cols * (BOOK.w + 4) + 10
  const caseX = W - caseW
  const caseInner = { x: caseX + 6, w: caseW - 10 }
  const signBay = { y: beamH - 8, h: SIGN_BAY_H }
  const firstBay = signBay.y + signBay.h + 3
  const lastFloor = deskY - 24
  const bayCount = compact ? 0 : Math.max(2, Math.floor((lastFloor - firstBay) / BAY))
  const bays = Array.from({ length: bayCount }, (_, i) => {
    const floor = firstBay + (i + 1) * BAY - 3
    // The lowest bay keeps one name on every screen, so things left there stay there.
    const id = i === bayCount - 1 ? 'bay-low' : `bay-${i + 1}`
    return { id, top: floor - BAY + 3, floor, x1: caseInner.x, x2: caseInner.x + caseInner.w }
  })
  // Books fill every bay but the lowest, which is left for things visitors put there,
  // unless the works don't fit without it.
  const bookBays = (bays.length - 1) * cols >= books ? bays.slice(0, -1) : bays
  const gap = (caseInner.w - cols * BOOK.w) / (cols + 1)
  const caseSlots = bookBays.flatMap((b) =>
    Array.from({ length: cols }, (_, c) => ({
      left: Math.round(caseInner.x + gap + c * (BOOK.w + gap)),
      top: b.floor - BOOK.h,
      width: BOOK.w,
      height: BOOK.h,
    })),
  )

  // The portrait's column: grows with spare width, never too thin to see a face. Phones have none.
  const windowW = compact ? 0 : Math.round(W >= REFERENCE.w ? clamp(40 + (W - REFERENCE.w) * 0.45, 40, 150) : clamp(40 - (REFERENCE.w - W) * 0.2, 30, 40))

  // The wall between the portrait and the bookcase.
  const wall = { x1: windowW, x2: caseX }
  const wallW = wall.x2 - wall.x1

  const { monitor, freeSpot = null, topShelfY, midShelf = null, library = null, toolShelf = null } = compact ? stackUpright(wall, deskY, beamH, books) : besideWide(wall, wallW, caseX, deskY)
  // Mide's portrait fills the left column, standing on the desk.
  const portrait = compact ? null : { x: 3, y: beamH + 3, w: windowW - 6, h: deskY - 1 - (beamH + 3) }
  // Where the works go: the library's spines on phones, the bookcase's bays elsewhere.
  const bookSlots = library ? library.spines : caseSlots
  const screen = { x: monitor.x + 3, y: monitor.y + 3, w: monitor.w - 6, h: monitor.h - 7 }
  const shelf = { x1: wall.x1 + 14, x2: caseX - 10, y: topShelfY }
  const shelfW = shelf.x2 - shelf.x1

  // Social tiles and the shelf's other things start at these fractions along the top shelf.
  // The lamp (the day/night switch) stands at the right end, just within reach of a thumb.
  // Phones also have the "My Resume" plaque, between the figure and LinkedIn.
  const spots = compact ? { figure: 0.05, plaque: 0.226, linkedin: 0.414, tiktok: 0.55, globe: 0.705 } : { figure: 0.03, linkedin: 0.64, tiktok: 0.735, globe: 0.835 }
  const onShelf = (f) => Math.round(shelf.x1 + shelfW * f)

  // The software I use, as app icons from the start of the shelf to the label boxes.
  // (after the figure at the shelf's left end, up to LinkedIn; on phones, on their own shelf).
  const appIcons = toolShelf ? placeAppIcons(toolShelf.x1 + 2, toolShelf.x2 - 2, toolShelf.y) : placeAppIcons(onShelf(spots.figure) + 8, onShelf(spots.linkedin) - 9, topShelfY)

  const lightBar = compact
    ? { x: monitor.x + Math.round(monitor.w * 0.2), y: monitor.y - 6, w: Math.round(monitor.w * 0.6) }
    : { x: monitor.x + 32, y: monitor.y - 6, w: monitor.w - 64 }
  const keyboardW = Math.min(76, Math.round(monitor.w * 0.55))

  // The person at the desk: centred on the chair (as drawChair places it), shoulders just
  // above the chair's back, so the head sits in front of the monitor's lower edge.
  const person = { x: monitor.x + (monitor.w >> 1) + 8, y: deskY + 30 }

  // The record player: at the foot of the bookcase, or on phones on the desk by the plant.
  const player = { x: compact ? windowW + 54 : caseX + 24, y: deskY }
  // The lamp, the day/night switch, at the right end of the top shelf.
  const lamp = { x: shelf.x2 - 11, y: topShelfY }

  const socialSlots = [spots.linkedin, spots.tiktok].map((f) => ({ x: onShelf(f), y: topShelfY }))
  // The "office in progress" plate, hanging from a nail: in the free spot on larger screens; on
  // phones under the tools shelf, over the monitor's top-right corner. x is the nail.
  const plate = compact
    ? { x: monitor.x + monitor.w - 42, y: toolShelf.y + 11, w: 72 }
    : freeSpot && { x: freeSpot.x + (freeSpot.w >> 1), y: freeSpot.y + 6, w: Math.min(56, freeSpot.w - 4) }

  // The "My Resume" plaque: on the phone's top shelf, or at the front of the desk past the
  // bookcase (as wide as that stretch allows, up to PLAQUE_W).
  const plaque = compact
    ? { x: onShelf(spots.plaque), y: topShelfY, w: PLAQUE_W }
    : { x: Math.round((caseX + 28 + W) / 2), y: deskY + 22, w: Math.min(PLAQUE_W, W - caseX - 32) }

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
    sign: library ? library.sign : { left: caseInner.x + 1, top: signBay.y + 3, width: caseInner.w - 2, height: 15 },
    counter: library ? library.counter : { left: caseX + caseW - 46, top: signBay.y + 3 + 15 + 1, width: 40, height: 7 },
    library,
    toolShelf,
    lamp,
    monitor,
    screen,
    lightBar,
    keyboardW,
    portrait,
    freeSpot,
    appIcons,
    socialSlots,
    plaque,
    plate,
    player,
    person,
    highShelf,
    midShelf,
    surfaces,
  }
}

/*
  The software I use, as app icons the size of the social tiles, in order of how much I use
  them: one row when they all fit between x1 and x2, else stacked two high (the bottom row the
  longer), centred. Each is { index (into APP_ICONS), x, y (top-left), size }.
*/
function placeAppIcons(x1, x2, shelfY) {
  const size = SOCIAL_SIZE.w
  const step = size + 1
  const cols = Math.max(1, Math.floor((x2 - x1 + 1) / step))
  const count = Math.min(APP_ICONS.length, cols * 2)
  const bottom = count <= cols ? count : Math.ceil(count / 2)
  return Array.from({ length: count }, (_, index) => {
    const level = index < bottom ? 0 : 1
    const inRow = level ? count - bottom : bottom
    const left = Math.round(x1 + (x2 - x1 + 1 - inRow * step + 1) / 2)
    return { index, x: left + (level ? index - bottom : index) * step, y: shelfY - (level + 1) * step + 1, size }
  })
}

/*
  Laptops and desktops: a free spot on the wall's left, behind the plant (kept for something
  new; it held a small portrait), and an ultrawide monitor (2:1 at most) taking the rest of
  the wall under the shelf, leaving room for the light bar on top.
*/
function besideWide(wall, wallW, caseX, deskY) {
  const topShelfY = deskY - 127
  const freeSpot = wallW >= 200 ? { x: wall.x1 + 8, y: topShelfY + 12, w: Math.min(64, Math.round(wallW * 0.32)), h: deskY - 1 - (topShelfY + 12) } : null
  const x1 = freeSpot ? freeSpot.x + freeSpot.w + 10 : wall.x1 + 16
  const w = caseX - 12 - x1
  const h = Math.min(Math.round(w * 0.5), deskY - 8 - (topShelfY + 22))
  return { topShelfY, freeSpot, monitor: { x: x1, y: deskY - 8 - h, w, h } }
}

/*
  Phones: stacked from the ceiling down, so nothing is wasted above the shelf and the works
  are on the first screen. The top shelf hangs just under the beam; below it the My Works
  sign and the visit counter, then the works standing as spines on a library shelf, and the
  monitor takes everything from there down to the desk. The library only depends on the
  room's width, so the address bar sliding away (a change in height) never moves the books.
*/
function stackUpright(wall, deskY, beamH, books) {
  const topShelfY = beamH + 30
  const x1 = wall.x1 + 10
  const x2 = wall.x2 - 10
  const signTop = topShelfY + 12
  const floor = signTop + LIBRARY.signH + 5 + LIBRARY.bookH
  const n = Math.max(books, 1)
  const spineW = clamp(Math.floor((x2 - x1 + 1) / n) - 1, LIBRARY.spineW.min, LIBRARY.spineW.max)
  const start = Math.round(x1 + (x2 - x1 - (n * (spineW + 1) - 1)) / 2)
  const spines = Array.from({ length: n }, (_, i) => {
    const h = LIBRARY.bookH - LIBRARY.drop[i % LIBRARY.drop.length]
    return { left: start + i * (spineW + 1), top: floor - h, width: spineW, height: h }
  })
  const library = {
    x1: x1 - 4,
    x2: x2 + 4,
    y: floor,
    spines,
    sign: { left: x1, top: signTop, width: 62, height: LIBRARY.signH },
    counter: { left: x2 - 58, top: signTop + 1, width: 58, height: LIBRARY.signH - 2 },
  }
  // The app icons' shelf, just under the library (one row of icons fits the phone's width).
  const toolShelf = { x1: x1 - 4, x2: x2 + 4, y: floor + 30 }
  const w = wall.x2 - wall.x1 - 20
  const below = toolShelf.y + 22
  // A monitor much taller than 3:2 looks stretched; when there's that much height, a small
  // shelf goes between the portrait and the monitor instead.
  const tall = deskY - 8 - below > w * MAX_UPRIGHT + 30
  const midShelf = tall ? { x1: wall.x1 + 14, x2: wall.x2 - 10, y: below + 16 } : null
  const y = midShelf ? midShelf.y + 16 : below
  const monitor = { x: wall.x1 + 10, y, w, h: deskY - 8 - y }
  return { monitor, topShelfY, midShelf, library, toolShelf }
}
// The upright monitor's height, at most, as a multiple of its width.
const MAX_UPRIGHT = 1.5

/*
  The room's pixel size for a screen of vw × vh CSS px. `scale` is CSS px per room pixel.
  Larger screens: pixels as big as possible while the room stays at least the reference
  height and MIN width, so a wide screen gets a wider room and an upright one a taller room.
  Phones: a fixed-width compact room that fits the screen's height.
  A window with no size (a hidden or background tab, a link preview) gets null: no room.
*/
export function roomSize(vw, vh, { phone = false } = {}) {
  if (!(vw > 0 && vh > 0)) return null
  if (phone) {
    const scale = vw / PHONE_W
    // The room fits the screen; only a very short one (the monitor would be a sliver) scrolls.
    return { W: PHONE_W, H: Math.max(Math.round(vh / scale), PHONE_MIN_H), scale }
  }
  const scale = Math.min(vw / MIN.w, vh / REFERENCE.h)
  return { W: Math.round(vw / scale), H: Math.round(vh / scale), scale }
}
