import { seeded } from './raster.js'
import { APP_ICONS, SPRITES, drawAppIcon, drawPlant, drawVine } from './sprites.js'

/*
  Paints the room into a raster, back to front, from a layout (layout.js) and a palette.
  Everything visitors can move is NOT drawn here: those are separate sprites on the page.
  Nor is the chair (drawChairLayer), which goes in front of the person at the desk.
*/
export function drawRoom(r, L, pal) {
  drawWall(r, L, pal)
  drawBeam(r, L, pal)
  drawTopShelf(r, L, pal)
  if (L.highShelf) drawHighShelf(r, L, pal)
  if (L.midShelf) drawShelfWith(r, L.midShelf, pal, [[0.18, 0.5]], 0.85, 93)
  if (L.library) drawPhoneShelf(r, L.library, pal)
  if (L.toolShelf) drawPhoneShelf(r, L.toolShelf, pal)
  // The app icons, on the top shelf or the phone's own (after the shelves, so no glow dims them;
  // layout.js places them and the page puts their names over them on hover).
  for (const { index, x, y } of L.appIcons) drawAppIcon(r, APP_ICONS[index], x, y)
  drawWallThings(r, L, pal)
  drawMonitor(r, L, pal)
  if (L.caseW) drawBookcase(r, L, pal)
  drawDesk(r, L, pal)
  drawDeskThings(r, L, pal)
  drawUnderDesk(r, L, pal)
  drawPlants(r, L, pal)
}

/*
  The office chair, on its own transparent layer drawn above everything else, so the person
  sitting in it (a page element between the two canvases) is hidden behind its back.
*/
export function drawChairLayer(r, L, pal) {
  drawChair(r, L, pal)
}

function drawWall(r, L, pal) {
  r.gradientV(0, 0, L.W, L.deskY, [pal.wallDeep, pal.wall, pal.wall, pal.wallDeep])
}

// The beam along the ceiling, with an LED strip underneath lighting the top shelf.
function drawBeam(r, L, pal) {
  r.rect(0, 0, L.caseX, L.beamH, pal.woodDark)
  r.hline(0, L.beamH - 2, L.caseX, pal.woodFront)
  r.hline(L.shelf.x1 + 6, L.beamH, L.shelf.x2 - L.shelf.x1 - 12, pal.led)
  r.glowDown(L.shelf.x1, L.beamH + 1, L.shelf.x2 - L.shelf.x1, 30, pal.ledGlow, 0.5)
}

function drawTopShelf(r, L, pal) {
  const { x1, x2, y } = L.shelf
  const w = x2 - x1
  // The stretch from 64% to 84% holds the social icons (drawn by the page, they're links).

  // The board: lit top edge, dark front, LED strip under it.
  r.rect(x1, y, w, 2, pal.woodLight)
  r.rect(x1, y + 2, w, 4, pal.woodFront)
  r.hline(x1, y + 6, w, pal.woodDark)
  r.hline(x1 + 6, y + 9, w - 12, pal.led)
  r.glowDown(x1, y + 10, w, 46, pal.ledGlow, 0.55)
}

// On tall screens: one more shelf high on the wall, with spines and a plant.
function drawHighShelf(r, L, pal) {
  drawShelfWith(r, L.highShelf, pal, [[0.12, 0.42], [0.6, 0.78]], 0.9, 57)
}

// A wall shelf with an LED strip under it, runs of book spines (as fractions along it) and a plant.
function drawShelfWith(r, { x1, x2, y }, pal, runs, plantAt, seed) {
  const w = x2 - x1
  runs.forEach(([from, to], i) => drawSpines(r, x1 + w * from, x1 + w * to, y, pal, seed + i * 14))
  r.rect(x1, y, w, 2, pal.woodLight)
  r.rect(x1, y + 2, w, 4, pal.woodFront)
  r.hline(x1, y + 6, w, pal.woodDark)
  r.hline(x1 + 6, y + 9, w - 12, pal.led)
  r.glowDown(x1, y + 10, w, 40, pal.ledGlow, 0.45)
  drawPlant(r, seeded(seed + 31), x1 + Math.round(w * plantAt), y, 1, pal)
}

/*
  A phone shelf (the library, the app icons): a board lit from the strip above, with its
  own strip underneath. The page puts the spines on the library; the icons are drawn after.
*/
function drawPhoneShelf(r, { x1, x2, y }, pal) {
  const w = x2 - x1
  r.rect(x1, y, w, 2, pal.woodLight)
  r.rect(x1, y + 2, w, 4, pal.woodFront)
  r.hline(x1, y + 6, w, pal.woodDark)
  r.hline(x1 + 6, y + 9, w - 12, pal.led)
  r.glowDown(x1, y + 10, w, 24, pal.ledGlow, 0.45)
}

// Book spines of random colours and heights, packed along a shelf.
function drawSpines(r, from, to, shelfY, pal, seed) {
  const rand = seeded(seed)
  const colours = ['#1f3a7a', '#2a5a4a', '#6a2a3a', '#3a2a6a', '#1a2a4a', '#7a4a2a', '#c8c0b0', '#2a4a8a']
  let x = Math.round(from)
  while (x < to - 3) {
    const w = 3 + Math.floor(rand() * 3)
    const h = 14 + Math.floor(rand() * 9)
    const c = colours[Math.floor(rand() * colours.length)]
    r.rect(x, shelfY - h, w, h, c)
    r.vline(x, shelfY - h, h, '#0c0a14')
    r.hline(x + 1, shelfY - h + 3, w - 1, '#d8c890')
    r.hline(x + 1, shelfY - 4, w - 1, '#d8c890')
    x += w + (rand() > 0.85 ? 2 : 0)
  }
}

function drawWallThings(r, L, pal) {
  if (L.board) drawBoard(r, L.board, pal)

  // The light bar on top of the monitor.
  const lb = L.lightBar
  r.rect(lb.x, lb.y, lb.w, 3, pal.lightBar)
  r.hline(lb.x + 2, lb.y + 2, lb.w - 4, pal.led)
  r.rect(lb.x + (lb.w >> 1) - 3, lb.y + 3, 6, 3, pal.lightBar)
}

/*
  The testimonial board: a wooden frame round a speckled cork panel (the page pins the notes
  and writes the header on it).
*/
function drawBoard(r, b, pal) {
  r.rect(b.x - 1, b.y - 1, b.w + 2, b.h + 2, pal.woodDark)
  r.rect(b.x, b.y, b.w, b.h, pal.woodFront)
  r.hline(b.x, b.y, b.w, pal.woodLight)
  r.vline(b.x, b.y, b.h, pal.woodTop)
  const c = { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 6 }
  r.gradientV(c.x, c.y, c.w, c.h, [pal.corkLight, pal.cork, pal.cork])
  const rand = seeded(23)
  for (let k = 0; k < (c.w * c.h) / 9; k++) r.px(c.x + Math.floor(rand() * c.w), c.y + Math.floor(rand() * c.h), rand() > 0.3 ? pal.corkDark : pal.corkLight)
  // The frame's shadow on the cork, along the top and left.
  r.hline(c.x, c.y, c.w, pal.corkDark)
  r.vline(c.x, c.y, c.h, pal.corkDark)
}

function drawMonitor(r, L, pal) {
  const m = L.monitor
  const s = L.screen
  // Glow on the wall around it.
  for (let k = 1; k <= 6; k++) r.blendRect(m.x - k, m.y - k, m.w + k * 2, m.h + k * 2, pal.monitorGlow, 0.05)
  r.rect(m.x, m.y, m.w, m.h, pal.bezel)
  r.hline(m.x, m.y, m.w, pal.bezelLit)

  // The wallpaper: dusk over a lake (the page puts demos or the terminal on top of it).
  r.gradientV(s.x, s.y, s.w, Math.round(s.h * 0.62), pal.screen)
  const horizon = s.y + Math.round(s.h * 0.62)
  for (let i = 0; i < s.w; i++) {
    const far = Math.round(5 + 4 * Math.sin(i * 0.11) + 3 * Math.sin(i * 0.037))
    const near = Math.max(0, Math.round(Math.abs(i - s.w / 2) / (s.w / 2) * 14 - 3 + 2 * Math.sin(i * 0.23)))
    r.vline(s.x + i, horizon - far, far, pal.mountainFar)
    r.vline(s.x + i, horizon - near, near, pal.mountain)
  }
  r.gradientV(s.x, horizon, s.w, s.y + s.h - horizon, [pal.water, pal.waterDeep])
  const cx = s.x + (s.w >> 1)
  for (let j = -3; j <= 0; j++) for (let i = -3; i <= 3; i++) if (i * i + j * j <= 10) r.px(cx + i, horizon - 1 + j, pal.sun)
  for (let j = 1; j < s.y + s.h - horizon; j += 2) {
    const len = Math.max(1, 5 - (j >> 1))
    r.hline(cx - (len >> 1), horizon + j, len, j < 6 ? pal.sun : pal.waterLit)
  }
  // Stand.
  r.rect(m.x + (m.w >> 1) - 5, m.y + m.h, 10, L.deskY - m.y - m.h + 2, pal.bezel)
  r.rect(m.x + (m.w >> 1) - 18, L.deskY + 1, 36, 3, pal.bezel)
  r.hline(m.x + (m.w >> 1) - 18, L.deskY + 1, 36, pal.bezelLit)
}

function drawBookcase(r, L, pal) {
  const x = L.caseX
  const w = L.caseW
  const bottom = L.deskY
  // Back panel, lit warm under every board.
  r.rect(x, 0, w, bottom, pal.caseBack)
  r.rect(x, 0, 5, bottom, pal.woodFront)
  r.vline(x + 4, 0, bottom, pal.woodTop)
  r.rect(L.W - 3, 0, 3, bottom, pal.woodFront)
  const boards = [L.sign.top + L.sign.height + 6, ...L.bays.map((b) => b.floor)]
  r.rect(x + 5, 0, w - 8, 3, pal.woodDark)
  r.hline(x + 9, 3, w - 16, pal.led)
  r.glowDown(x + 5, 4, w - 8, 18, pal.ledGlow, 0.3)
  for (const y of boards) {
    r.rect(x + 5, y, w - 8, 2, pal.woodLight)
    r.rect(x + 5, y + 2, w - 8, 2, pal.woodFront)
    r.hline(x + 9, y + 4, w - 16, pal.led)
    r.glowDown(x + 5, y + 5, w - 8, 18, pal.ledGlow, 0.3)
  }
}

function drawDesk(r, L, pal) {
  const y = L.deskY
  // Top surface: shines where the wall's lights reflect at the back, darker towards you.
  // Hard bands, as a pixel artist would light it: the shine at the back, then the lit wood.
  r.rect(0, y, L.W, 22, pal.deskTop)
  r.rect(0, y, L.W, 7, pal.deskLit)
  r.rect(0, y, L.W, 2, pal.deskShine)
  r.hline(0, y + 7, L.W, pal.deskLine)
  // The monitor's blue light reflected in the glossy top.
  const m = L.monitor
  for (let j = 1; j < 8; j++) r.blendRect(m.x + 6 + j, y + j, m.w - 12 - j * 2, 1, '#4a4ac0', 0.22 * (1 - j / 8))
  r.rect(0, y + 22, L.W, 5, pal.deskFront)
  r.hline(0, y + 22, L.W, pal.deskLit)
  r.rect(0, y + 27, L.W, L.H - y - 27, pal.underDesk)
}

function drawDeskThings(r, L, pal) {
  const m = L.monitor
  const cx = m.x + (m.w >> 1)
  // Desk mat, keyboard with its glow, and the mouse.
  const mat = { x: cx - (L.keyboardW >> 1) - 16, y: L.deskY + 7, w: L.keyboardW + 50, h: 13 }
  r.rect(mat.x + 1, mat.y, mat.w - 2, mat.h, pal.mat)
  r.hline(mat.x + 1, mat.y, mat.w - 2, '#2a1e2e')
  r.hline(mat.x + 1, mat.y + mat.h, mat.w - 2, '#0c080e')
  // Keyboard: rows of keys with a few lit in the RGB colours, and its underglow.
  const kb = { x: cx - (L.keyboardW >> 1), y: L.deskY + 9, w: L.keyboardW, h: 9 }
  r.blendRect(kb.x - 3, kb.y + kb.h, kb.w + 6, 2, pal.keyGlowA, 0.4)
  r.rect(kb.x, kb.y, kb.w, kb.h, pal.keyboard)
  r.hline(kb.x, kb.y, kb.w, '#24224a')
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < Math.floor((kb.w - 3) / 3); i++) {
      const lit = (i * 7 + j * 3) % 11 === 0
      r.rect(kb.x + 2 + i * 3, kb.y + 1 + j * 2, 2, 1, lit ? (i % 2 ? pal.keyGlowB : pal.keyGlowA) : pal.key)
    }
  r.rect(kb.x + Math.round(kb.w * 0.29), kb.y + 7, Math.round(kb.w * 0.4), 1, '#3a3a6a')
  r.sprite(SPRITES.mouse.rows, SPRITES.mouse.key, kb.x + kb.w + 14, kb.y + 3)
}

function drawUnderDesk(r, L, pal) {
  const top = L.deskY + 30
  // PC on the floor, left.
  const pc = { x: L.boardW + 6, w: 42 }
  r.rect(pc.x, top, pc.w, L.H - top, pal.pc)
  r.hline(pc.x, top, pc.w, '#1a2040')
  const lx = pc.x + 12
  const ly = top + 16
  for (let i = 0; i < 6; i++) {
    r.px(lx + i, ly + i, pal.pcLit)
    r.px(lx + 5 - i, ly + i, pal.pcLit)
  }
  r.px(pc.x + 34, top + 12, pal.pcLit)
  r.px(pc.x + 34, top + 18, pal.pcLit)
  r.px(pc.x + 34, top + 21, pal.pcLit)

  // Drawers on the right, under the bookcase.
  if (!L.caseW) return
  const cab = { x: L.caseX + 2, w: L.W - L.caseX - 2 }
  r.rect(cab.x, top - 2, cab.w, L.H - top + 2, pal.cabinet)
  for (let y = top + 4; y < L.H; y += 14) {
    r.rect(cab.x + 3, y, cab.w - 6, 11, pal.drawer)
    r.hline(cab.x + 3, y, cab.w - 6, pal.drawerLit)
    r.rect(cab.x + (cab.w >> 1) - 6, y + 4, 12, 2, pal.handle)
  }
}

// The office chair, seen from behind: mesh back between two arms.
function drawChair(r, L, pal) {
  const cx = L.monitor.x + (L.monitor.w >> 1) + 8
  const top = L.deskY + 22
  const w = Math.min(92, Math.round(L.monitor.w * 0.74))
  for (let y = top; y < L.H; y++) {
    const d = y - top
    // Rounded shoulders at the top, then a back that narrows slightly towards the seat.
    const shoulder = d < 8 ? Math.round(8 - Math.sqrt(64 - (8 - d) * (8 - d))) : 0
    const half = Math.round(w / 2 - shoulder - Math.max(0, d - 30) * 0.15)
    r.hline(cx - half, y, half * 2, pal.chair)
    r.px(cx - half, y, pal.chairLit)
    r.px(cx + half - 1, y, pal.chairLit)
    r.px(cx - half + 1, y, pal.chairMesh)
    if (d > 3 && d % 2 === 0) for (let x = cx - half + 4 + (d % 4 ? 1 : 0); x < cx + half - 4; x += 2) r.px(x, y, pal.chairMesh)
  }
  // Arms.
  for (const side of [-1, 1]) {
    const ax = cx + side * ((w >> 1) + 6)
    r.rect(ax - 10, L.H - 22, 20, 5, pal.chairArm)
    r.hline(ax - 10, L.H - 22, 20, pal.chairLit)
  }
}

function drawPlants(r, L, pal) {
  const rand = seeded(42)
  // Big plant on the desk: against the testimonial board's corner, or on phones at the left.
  drawPlant(r, rand, L.compact ? 18 : L.boardW + 4, L.deskY + 2, 2, pal)
  // A plant at the foot of the bookcase, on the desk.
  if (!L.compact) drawPlant(r, rand, L.W - 14, L.deskY + 1, 1, pal)
  // Vines trailing from the top shelf's ends and down the bookcase's side.
  drawVine(r, rand, L.shelf.x1 + 2, L.shelf.y + 2, 48, pal)
  drawVine(r, rand, L.shelf.x1 + 9, L.shelf.y + 2, 30, pal)
  drawVine(r, rand, L.caseX - 4, L.beamH, 70, pal)
  drawVine(r, rand, L.boardW + 3, L.beamH, 38, pal)
}
