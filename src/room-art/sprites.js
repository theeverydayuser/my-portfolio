/*
  Pixel maps for the room's objects: one character per pixel, '.' is transparent.
  Each sprite carries its own colour key. Sizes are in room pixels.
  The lamp light comes from the right, so right-hand edges get the warm colour.
*/
const OUTLINE = '#0b0a14'

export const SPRITES = {











  mouse: {
    key: { k: '#101230', h: '#2a2c5a', b: '#5a6aff' },
    rows: ['..hhh..', '.hkbkk.', 'hkkkkkk', 'kkkkkkk', '.kkkkk.'],
  },
}


/*
  One leaf: an ellipse pointing along `angle`, lit along its upper edge, dark underneath,
  with a shine pixel. Plants and vines are built from these.
*/
export function drawLeaf(r, x, y, angle, len, wid, pal) {
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const reach = Math.ceil(len) + 1
  const inside = (u, v) => ((u - len / 2) / (len / 2)) ** 2 + (v / (wid / 2)) ** 2 <= 1
  for (let j = -reach; j <= reach; j++)
    for (let i = -reach; i <= reach; i++) {
      // Leaf-local coordinates: u along the leaf, v across it (negative = the side facing up).
      const u = i * ca + j * sa
      const v = -i * sa + j * ca
      if (!inside(u, v)) continue
      const edge = !inside(u, v + 1) || !inside(u + 1, v)
      const up = sa < 0 ? -v : v
      const tone = edge && up < 0 ? pal.leafDark : up > wid * 0.15 ? (u > len * 0.55 ? pal.leafShine : pal.leafLight) : pal.leaf
      r.px(x + i, y + j, tone)
    }
}

/*
  A potted plant: leaves on short stems fanning out of the pot, the back ones first.
  Seeded, so each plant keeps its shape. `size` 1 is a small shelf plant, 2 a desk plant.
*/
export function drawPlant(r, rand, cx, baseY, size, pal) {
  const potW = 6 + size * 4
  const potH = 4 + size * 3
  const potX = cx - (potW >> 1)
  const potY = baseY - potH
  const count = 7 + size * 8
  const reach = 5 + size * 6
  const leaves = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.3
    return { angle, dist: reach * (0.45 + rand() * 0.55), len: 3 + size * 1.6 + rand() * 2, wid: 2 + size * 0.7 }
  }).sort((a, b) => b.dist - a.dist)
  for (const leaf of leaves) {
    const sx = cx + Math.cos(leaf.angle) * leaf.dist * 0.5
    const sy = potY + Math.sin(leaf.angle) * leaf.dist * 0.5
    // Stem from the pot to the leaf.
    for (let k = 0; k < 1; k += 0.2) r.px(cx + (sx - cx) * k, potY + (sy - potY) * k, pal.leafDark)
    // Leaves droop as they get further out.
    drawLeaf(r, Math.round(sx), Math.round(sy), leaf.angle + Math.sign(Math.cos(leaf.angle)) * 0.35, leaf.len, leaf.wid, pal)
  }
  // Pot: tapered, lit on the right.
  for (let j = 0; j < potH; j++) {
    const inset = j > potH - 3 ? 1 : 0
    r.hline(potX + inset, potY + j, potW - inset * 2, pal.pot)
    r.px(potX + potW - 1 - inset, potY + j, pal.potLit)
    r.px(potX + potW - 2 - inset, potY + j, pal.potLit)
    r.px(potX + inset, potY + j, pal.potDark)
  }
  r.hline(potX - 1, potY, potW + 2, pal.potLit)
}

// A trailing vine hanging from (x, y): a swaying stem with small leaves off alternate sides.
export function drawVine(r, rand, x, y, length, pal) {
  let sx = x
  for (let j = 0; j < length; j++) {
    sx += Math.sin(j * 0.3 + rand() * 0.5) * 0.5
    r.px(sx, y + j, pal.leafDark)
    if (j % 4 === 1) {
      const side = ((j - 1) / 4) % 2 === 0 ? -1 : 1
      drawLeaf(r, Math.round(sx) + side * 2, y + j, side < 0 ? Math.PI * 0.85 : Math.PI * 0.15, 3.6 + rand(), 2.6, pal)
    }
  }
}

// Book cover colours, by name (works.js picks one per work).
export const COVERS = {
  navy: '#26387e',
  purple: '#5a2c8c',
  sage: '#4a7a5c',
  teal: '#1f6f7a',
  coral: '#c2552f',
  charcoal: '#30323c',
  crimson: '#9a2a46',
  mustard: '#b88a2a',
}

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))))
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
}

// A standing book, seen front-on: dark spine with a light line, lit top, shaded foot, corner pattern.
export function drawBookCover(r, w, h, base) {
  r.rect(0, 0, w, h, base)
  r.rect(0, 0, 3, h, shade(base, -0.45))
  r.vline(3, 0, h, shade(base, 0.25))
  r.hline(4, 0, w - 4, shade(base, 0.2))
  r.rect(4, h - 2, w - 4, 2, shade(base, -0.3))
  r.vline(w - 1, 1, h - 3, shade(base, -0.2))
  const light = shade(base, 0.3)
  for (const [dx, dy] of [[-4, -5], [-6, -4], [-3, -7], [-5, -6], [-7, -3], [-3, -4]]) r.px(w + dx, h + dy, light)
}

/*
  A book seen spine-on, standing on the phone's library shelf: rounded lit edge on the left,
  shaded right, and gilt bands near the top and the foot (the title is written over it).
*/
export function drawBookSpine(r, w, h, base) {
  r.rect(0, 0, w, h, base)
  r.vline(0, 0, h, shade(base, -0.5))
  r.vline(1, 0, h, shade(base, 0.25))
  r.vline(w - 1, 0, h, shade(base, -0.4))
  r.hline(1, 0, w - 2, shade(base, 0.2))
  const gilt = '#d8c890'
  for (const y of [3, 5, h - 6, h - 4]) r.hline(2, y, w - 4, gilt)
}

/*
  The movable objects, drawn at about twice the detail of the little maps above, to match
  the reference's proportions (the mug is ~18 room px wide next to a 150 px monitor).
  Each is { w, h, draw(r) } drawing at (0, 0); lamp light comes from the right.
*/
const disc = (r, cx, cy, rad, fill) => {
  for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (i * i + j * j <= rad * rad + rad * 0.6) fill(cx + i, cy + j, i, j)
}

const PROPS_ART = {
  mug: {
    w: 18,
    h: 15,
    draw(r) {
      r.rect(1, 1, 13, 13, '#1c1c32')
      r.hline(1, 0, 13, '#3c3c66')
      r.hline(2, 1, 11, '#0c0c18')
      r.vline(12, 1, 13, '#5a3a2e')
      r.vline(13, 1, 13, '#6e4632')
      r.hline(2, 14, 11, '#0b0a14')
      r.vline(0, 1, 13, '#0b0a14')
      // Handle.
      r.rect(14, 3, 3, 2, '#1c1c32')
      r.rect(16, 4, 2, 6, '#1c1c32')
      r.rect(14, 9, 3, 2, '#1c1c32')
      r.vline(17, 4, 6, '#6e4632')
      // X logo.
      for (let k = 0; k < 5; k++) {
        r.px(4 + k, 5 + k, '#b2b2cc')
        r.px(8 - k, 5 + k, '#b2b2cc')
      }
    },
  },
  'pencil-cup': {
    w: 12,
    h: 20,
    draw(r) {
      const pencils = [
        [2, 0, '#e8b84a', '#f4d48a'],
        [4, 3, '#4a7ad8', '#8ab0ff'],
        [7, 1, '#d24a3a', '#f08a7a'],
        [9, 4, '#e8e0d0', '#ffffff'],
      ]
      for (const [x, top, body, light] of pencils) {
        r.px(x, top, '#2a2a3a')
        r.vline(x, top + 1, 9 - top, body)
        r.vline(x + 1, top + 1, 9 - top, light)
      }
      r.rect(0, 8, 12, 12, '#1c1c34')
      r.hline(0, 8, 12, '#3a3a64')
      r.vline(0, 9, 11, '#0b0a14')
      r.rect(10, 9, 2, 11, '#6e4632')
      r.hline(1, 19, 10, '#0b0a14')
    },
  },
  globe: {
    w: 16,
    h: 22,
    draw(r) {
      // Brass meridian arc, then the globe inside it.
      for (let a = -1.9; a <= 1.4; a += 0.05) r.px(8 + Math.round(Math.cos(a) * 8), 8 + Math.round(Math.sin(a) * 8), a > 0.4 ? '#7a5428' : '#d29a4a')
      disc(r, 8, 8, 6, (x, y, i, j) => {
        const land = Math.sin(i * 0.9 + 1) + Math.cos(j * 1.1 - 0.5) > 1.1
        const lit = i + j < -3
        r.px(x, y, land ? (lit ? '#9ab85a' : '#6a8c3c') : lit ? '#4a74d0' : i + j > 5 ? '#1e3a7a' : '#2c4c9c')
      })
      r.vline(8, 15, 3, '#b07a3a')
      r.rect(4, 18, 9, 2, '#b07a3a')
      r.hline(3, 20, 11, '#7a5428')
      r.hline(4, 18, 9, '#e0a85a')
    },
  },
  camera: {
    w: 20,
    h: 14,
    draw(r) {
      r.rect(5, 0, 7, 3, '#a2a2b4')
      r.hline(5, 0, 7, '#d6d6e2')
      r.rect(15, 1, 3, 2, '#17172a')
      r.px(16, 1, '#e04a3a')
      r.rect(0, 3, 20, 10, '#17172a')
      r.rect(0, 4, 20, 2, '#a2a2b4')
      r.hline(0, 4, 20, '#d6d6e2')
      r.hline(1, 13, 18, '#0b0a14')
      r.vline(19, 3, 10, '#5a3a2e')
      disc(r, 10, 8, 4, (x, y, i, j) => r.px(x, y, i * i + j * j > 9 ? '#3a3a52' : i + j < -1 ? '#8ab0ff' : '#1e2c5a'))
      r.px(9, 7, '#d0e0ff')
    },
  },
  figure: {
    w: 9,
    h: 20,
    draw(r) {
      const k = '#17141f'
      r.rect(1, 0, 2, 2, k)
      r.rect(6, 0, 2, 2, k)
      r.rect(0, 1, 9, 7, k)
      r.px(2, 4, '#4a4458')
      r.px(6, 4, '#4a4458')
      r.rect(2, 8, 5, 1, k)
      r.rect(1, 9, 7, 7, k)
      r.rect(0, 10, 1, 4, k)
      r.rect(8, 10, 1, 4, k)
      r.rect(1, 16, 3, 4, k)
      r.rect(5, 16, 3, 4, k)
      r.vline(8, 1, 7, '#4a3436')
      r.vline(7, 9, 7, '#4a3436')
      r.hline(1, 1, 6, '#3a3448')
    },
  },
  'phone-stand': {
    w: 12,
    h: 18,
    draw(r) {
      r.rect(2, 0, 8, 14, '#0b0a14')
      r.rect(3, 1, 6, 12, '#16245c')
      r.rect(3, 1, 6, 4, '#20358a')
      // A tiny clock face glowing on the lock screen.
      r.px(5, 6, '#cfe0ff')
      r.px(6, 6, '#cfe0ff')
      r.px(6, 7, '#8aa8ff')
      r.vline(9, 1, 12, '#6e4632')
      r.rect(4, 14, 4, 2, '#2a2a46')
      r.rect(0, 16, 12, 2, '#22223a')
      r.hline(0, 16, 12, '#3c3c60')
    },
  },
  speaker: {
    w: 12,
    h: 16,
    draw(r) {
      r.rect(0, 0, 12, 16, '#1a1a2c')
      r.hline(0, 0, 12, '#33334e')
      r.vline(10, 1, 15, '#4a3a34')
      r.vline(11, 1, 15, '#6e4632')
      disc(r, 5, 4, 2, (x, y, i, j) => r.px(x, y, i * i + j * j > 2 ? '#3e3e60' : '#0c0c18'))
      disc(r, 5, 11, 3, (x, y, i, j) => r.px(x, y, i * i + j * j > 5 ? '#3e3e60' : i + j < 0 ? '#22223a' : '#0c0c18'))
      r.hline(1, 15, 9, '#0b0a14')
    },
  },
  tower: {
    w: 10,
    h: 26,
    draw(r) {
      r.rect(0, 0, 10, 26, '#10142c')
      r.hline(0, 0, 10, '#262c52')
      r.vline(0, 1, 25, '#0b0a14')
      r.vline(9, 1, 25, '#4a3a34')
      r.vline(2, 3, 20, '#3a7cff')
      r.vline(2, 3, 3, '#9ac0ff')
      r.px(6, 18, '#3a7cff')
      r.hline(1, 25, 8, '#0b0a14')
    },
  },
  notebooks: {
    w: 40,
    h: 13,
    draw(r) {
      const books = [
        { dx: 3, w: 34, cover: '#1e2448', icon: '#e8b84a' },
        { dx: 1, w: 37, cover: '#232a52', icon: '#6ac06a' },
        { dx: 0, w: 40, cover: '#1a2044', icon: '#e8743a' },
      ]
      books.forEach((b, i) => {
        const y = i * 4 + 1
        r.rect(b.dx, y, b.w, 4, b.cover)
        r.hline(b.dx, y, b.w, '#323a6a')
        r.rect(b.dx + b.w - 4, y + 1, 4, 3, '#d8c4a0')
        r.vline(b.dx + b.w - 1, y, 4, '#6e4632')
        r.rect(b.dx + 3, y + 1, 2, 2, b.icon)
        // A pale line where the label is written.
        r.hline(b.dx + 7, y + 2, Math.round(b.w * 0.35), '#4a5288')
      })
    },
  },
  // Over-ear headphones resting on a stand: arched band, padded cups, blue accents.
  headset: {
    w: 22,
    h: 26,
    draw(r) {
      r.rect(5, 24, 12, 2, '#22223a')
      r.hline(5, 24, 12, '#3c3c60')
      r.rect(10, 4, 2, 20, '#22223a')
      r.vline(11, 4, 20, '#3c3c60')
      const cx = 11
      const cy = 11
      for (let a = Math.PI; a <= Math.PI * 2; a += 0.03)
        for (let t = 0; t < 2.2; t += 0.7) r.px(cx + Math.cos(a) * (10 - t), cy + Math.sin(a) * (10 - t), t < 0.7 ? '#3a3a62' : '#15152a')
      for (const side of [-1, 1]) {
        const x = side < 0 ? 0 : 16
        r.rect(x, 10, 6, 11, '#15152a')
        r.rect(x + 1, 11, 4, 9, '#1f1f3a')
        r.vline(side < 0 ? x + 5 : x, 11, 9, '#33335a')
        r.vline(side < 0 ? x : x + 5, 13, 5, '#3a5ad0')
        r.hline(x + 1, 10, 4, '#3a3a62')
      }
    },
  },
  'note-yellow': { w: 9, h: 9, draw: (r) => drawNote(r, '#e8c45a', '#b8923a') },
  'note-blue': { w: 9, h: 9, draw: (r) => drawNote(r, '#8ab4e8', '#4e6ea8') },
}

function drawNote(r, paper, ink) {
  r.rect(0, 0, 9, 9, paper)
  r.hline(1, 2, 6, ink)
  r.hline(1, 4, 5, ink)
  r.hline(1, 6, 6, ink)
  // Curled corner.
  r.px(8, 8, '#0b0a14')
  r.px(7, 8, ink)
  r.px(8, 7, ink)
}

// Art for a movable object, by id: its size and how to draw it at (0, 0).
export const propSprite = (id) => PROPS_ART[id]

/*
  Social icons: 15 × 15 app-style tiles that stand on a shelf.
  LinkedIn: white "in" on blue. TikTok: the note in white with its cyan and red echoes.
*/
export const SOCIAL_SIZE = { w: 15, h: 15 }

// A rounded 15 × 15 tile with a shaded bottom and right edge, its top-left corner at x, y.
function drawTile(r, fill, edge, x = 0, y = 0) {
  r.rect(x + 1, y, 13, 15, fill)
  r.rect(x, y + 1, 15, 13, fill)
  r.hline(x + 1, y + 14, 13, edge)
  r.vline(x + 14, y + 1, 13, edge)
}

export const SOCIAL_ICONS = {
  linkedin(r) {
    drawTile(r, '#0a66c2', '#064a8e')
    r.hline(2, 1, 11, '#3a8ae0')
    const w = '#ffffff'
    r.rect(3, 3, 2, 2, w)
    r.rect(3, 6, 2, 6, w)
    r.rect(6, 6, 2, 6, w)
    r.rect(8, 6, 3, 2, w)
    r.rect(10, 7, 2, 5, w)
  },
  tiktok(r) {
    drawTile(r, '#111118', '#000000')
    r.hline(2, 1, 11, '#2a2a36')
    // The note: stem, flag and ball, drawn three times, offset, for the glitch echo.
    const note = (dx, dy, colour) => {
      r.rect(8 + dx, 3 + dy, 2, 7, colour)
      r.rect(10 + dx, 4 + dy, 2, 1, colour)
      r.rect(11 + dx, 5 + dy, 1, 1, colour)
      for (let j = -1; j <= 1; j++) for (let i = -2; i <= 1; i++) if (i * i + j * j < 4) r.px(7 + i + dx, 10 + j + dy, colour)
    }
    note(-1, 0, '#25f4ee')
    note(1, 1, '#fe2c55')
    note(0, 0, '#ffffff')
  },
}

/*
  The record player at the foot of the bookcase, 32 × 13. `frame` (0–3) turns the record:
  the label's white mark goes round while music plays.
*/
export const TURNTABLE_SIZE = { w: 32, h: 13 }
export function drawTurntable(r, frame = 0) {
  // Wooden plinth, lit on top, with a knob and a power light.
  r.rect(0, 6, 32, 7, '#5a3020')
  r.hline(0, 6, 32, '#8a4c2e')
  r.hline(0, 12, 32, '#24141a')
  r.vline(31, 7, 5, '#a2582f')
  r.rect(3, 9, 2, 2, '#c8c0b0')
  r.px(27, 9, frame === null ? '#3a2a2a' : '#7dffae')
  // Platter: a black record seen from just above, with grooves and a red label.
  // The platter's silver rim shows round the black record.
  for (let j = 0; j < 5; j++) {
    const half = [7, 10, 11, 10, 7][j]
    r.hline(14 - half - 1, 1 + j, half * 2 + 2, '#8a8aa0')
    r.hline(14 - half, 1 + j, half * 2, '#15151f')
  }
  r.hline(7, 0, 14, '#8a8aa0')
  // Grooves catching the lamp light.
  r.hline(6, 2, 5, '#3e3e5a')
  r.hline(18, 2, 4, '#3e3e5a')
  r.hline(5, 4, 6, '#33334c')
  r.hline(17, 4, 6, '#33334c')
  r.rect(12, 2, 4, 3, '#d24a3a')
  const marks = [[12, 2], [15, 2], [15, 4], [12, 4]]
  const [mx, my] = marks[(frame ?? 0) % 4]
  r.px(mx, my, '#f3eee6')
  // Tonearm from its post on the right, resting on the record.
  r.rect(27, 0, 2, 6, '#3a3a52')
  r.px(27, 0, '#a2a2b4')
  for (let k = 0; k < 6; k++) r.px(26 - k, 1 + Math.floor(k / 2), '#c8c8d6')
}

/*
  Mide at the desk, seen from behind: shoulders in the black turtleneck (the chair's back
  covers the rest), and a head that turns toward the pointer.
*/
export const PERSON_BODY = { w: 56, h: 40 }
export function drawPersonBody(r) {
  const { w, h } = PERSON_BODY
  const cx = w >> 1
  for (let y = 4; y < h; y++) {
    // Shoulders curve down from the collar, then the back runs straight.
    const half = Math.min(27, Math.round(8 + Math.sqrt(y - 4) * 5.4))
    r.hline(cx - half, y, half * 2, '#121218')
    // Rim light: cool from the monitor on the left, warm from the lamp strip on the right.
    r.px(cx - half, y, '#23233a')
    r.px(cx + half - 1, y, '#4a3020')
    r.px(cx + half - 2, y, '#2a2434')
    if (y === 4 || half < 27) {
      r.px(cx - half + 1, y, '#2c2c44')
      r.px(cx + half - 3, y, '#3a3040')
    }
  }
  // Neck, then the rolled turtleneck collar around it.
  r.rect(cx - 5, 0, 10, 6, '#4f3220')
  r.vline(cx + 4, 0, 6, '#38220f')
  r.rect(cx - 8, 4, 16, 5, '#18181f')
  r.hline(cx - 8, 4, 16, '#2a2a38')
  r.hline(cx - 7, 6, 14, '#22222c')
  // The gold chain, just catching the light at the side of the collar.
  r.px(cx + 8, 7, '#e8b84a')
  r.px(cx + 9, 8, '#b8862e')
}

export const HEAD = { w: 26, h: 27 }
export const HEAD_TURNS = 3

const SKIN = { outline: '#22140a', shadow: '#3e2716', base: '#5a3a22', lit: '#7a4e2c', bright: '#a8703f', shine: '#d9a066' }

/*
  The head, `turn` -3 (looking far left) … 0 (facing the monitor, away from us) … 3 (far
  right), `tilt` -1 (up) … 1 (down). Turning slides the near ear round and shows that
  side's profile: brow, gold round glasses, nose and goatee. Left turns are right ones mirrored.
*/
export function drawHead(r, turn, tilt) {
  const a = Math.abs(turn)
  const flip = turn < 0
  const W = HEAD.w
  const px = (x, y, c) => r.px(flip ? W - 1 - x : x, y, c)
  // The skull's centre drifts a little toward the turn, so the head reads as rotating.
  const cx = 13 + a * 0.4
  const cy = 12
  const f = tilt

  // Crown round, jaw narrowing toward the chin.
  const halfAt = (y) => {
    const t = (y + 0.5 - cy) / 11.5
    if (Math.abs(t) > 1) return 0
    const base = 9.5 * Math.sqrt(1 - t * t)
    return y > cy + 3 ? base - (y - cy - 3) * 0.28 : base
  }
  const inside = (x, y) => Math.abs(x + 0.5 - cx) <= halfAt(y)

  for (let y = 0; y < HEAD.h; y++)
    for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)
      // Lit from the strip above and a little to the left; shadowed low and on the right.
      const dx = x + 0.5 - cx
      const shine = (dx + 3) ** 2 + (y - 3 - f) ** 2
      let c = SKIN.base
      if (shine <= 2) c = SKIN.shine
      else if (shine <= 9) c = SKIN.bright
      else if ((dx + 2) ** 2 + (y - 4 - f) ** 2 <= 30) c = SKIN.lit
      else if (dx > 6 || y > cy + 7) c = SKIN.shadow
      if (edge) c = SKIN.outline
      px(x, y, c)
    }

  // Ears: 3 × 5, lit rim, dark inner fold.
  const ear = (x, y, side) => {
    for (let j = 0; j < 5; j++) {
      const w = j === 0 || j === 4 ? 2 : 3
      for (let i = 0; i < w; i++) px(side < 0 ? x + 2 - i : x + i, y + j, i === w - 1 ? SKIN.outline : SKIN.base)
    }
    px(side < 0 ? x + 1 : x + 1, y + 2, SKIN.shadow)
    px(side < 0 ? x + 2 : x, y + 1, SKIN.lit)
  }
  const earY = 11 + f
  const leftEdge = Math.round(cx - 9.5)
  const rightEdge = Math.round(cx + 9.5)
  if (a === 0) {
    ear(leftEdge - 2, earY, -1)
    ear(rightEdge - 1, earY, 1)
  } else {
    if (a === 1) ear(leftEdge - 2, earY, -1)
    // The near ear slides round toward the back of the head as it turns.
    ear(rightEdge - 1 - a * 3, earY, 1)
  }

  if (a >= 1) {
    // Arm of the glasses, ear to the front of the face.
    for (let x = rightEdge - a * 3 + 2; x <= rightEdge; x++) px(x, earY, '#d4a24a')
  }
  if (a >= 2) {
    const lx = rightEdge - 3
    // Brow above the lens.
    for (let x = lx; x <= lx + 3; x++) px(x, earY - 3, SKIN.outline)
    // Round gold lens on the face edge, dark glass inside.
    for (const [dx, dy] of [[1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [1, 3], [2, 3]]) px(lx + dx, earY - 1 + dy, '#f0c060')
    px(lx + 1, earY, '#1a1a2e')
    px(lx + 2, earY, '#2a3a6a')
    px(lx + 1, earY + 1, '#1a1a2e')
    px(lx + 2, earY + 1, '#1a1a2e')
    // Nose past the face edge, then the goatee along the jaw.
    px(rightEdge + 1, earY + 4, SKIN.base)
    px(rightEdge + 1, earY + 5, SKIN.shadow)
    if (a === 3) px(rightEdge + 2, earY + 5, SKIN.base)
    for (let x = rightEdge - 5; x <= rightEdge - 1; x++) px(x, 21 + f, '#140c06')
    for (let x = rightEdge - 4; x <= rightEdge - 2; x++) px(x, 22 + f, '#140c06')
  }
}

/*
  The software I use, as app icons the size of the social tiles, most used first (a narrow
  room shows only the first few). Each glyph is an 11 × 11 map ('.' is the tile showing through).
*/
const LETTERS = {
  A: ['.ww.', 'w..w', 'w..w', 'wwww', 'w..w', 'w..w'],
  P: ['www.', 'w..w', 'w..w', 'www.', 'w...', 'w...'],
  e: ['.ww.', 'wwww', 'w...', '.www'],
  s: ['.www', 'ww..', '..ww', 'www.'],
  i: ['w', '.', 'w', 'w', 'w', 'w'],
}

// An Adobe-style two-letter mark ("Ps"): the capital, then the small letter sitting on the same line.
function letterGlyph(cap, small) {
  const grid = Array.from({ length: 11 }, () => Array(11).fill('.'))
  const stamp = (rows, x, y) => rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== '.' && (grid[y + j][x + i] = ch)))
  stamp(LETTERS[cap], 1, 2)
  stamp(LETTERS[small], LETTERS[small][0].length === 1 ? 7 : 6, 8 - LETTERS[small].length)
  return grid.map((row) => row.join(''))
}

const appIcon = (name, fill, edge, shine, key, glyph) => ({ name, fill, edge, shine, key, glyph })

export const APP_ICONS = [
  appIcon('Figma', '#2c2c2c', '#161616', '#444444', { r: '#f24e1e', o: '#ff7262', p: '#a259ff', b: '#1abcfe', g: '#0acf83' }, [
    '...........',
    '....rroo...',
    '...rrrooo..',
    '....rroo...',
    '....ppbb...',
    '...pppbbb..',
    '....ppbb...',
    '....gg.....',
    '...ggg.....',
    '....gg.....',
    '...........',
  ]),
  appIcon('Claude', '#d97757', '#a8533a', '#e8987c', { w: '#fbf0e6' }, [
    '...........',
    '.....w.....',
    '..w..w..w..',
    '...w.w.w...',
    '....www....',
    '.wwwwwwwww.',
    '....www....',
    '...w.w.w...',
    '..w..w..w..',
    '.....w.....',
    '...........',
  ]),
  appIcon('Codex', '#16161a', '#060608', '#2e2e36', { w: '#f4f4f6' }, [
    '...........',
    '...........',
    '...........',
    '.ww........',
    '..ww.......',
    '...ww......',
    '..ww.......',
    '.ww...wwww.',
    '...........',
    '...........',
    '...........',
  ]),
  appIcon('ChatGPT', '#10a37f', '#0a6e56', '#3cbf9c', { w: '#ffffff' }, [
    '...........',
    '....www....',
    '..www.www..',
    '..w.....w..',
    '.ww.www.ww.',
    '.w..w.w..w.',
    '.ww.www.ww.',
    '..w.....w..',
    '..www.www..',
    '....www....',
    '...........',
  ]),
  appIcon('Gemini', '#1b1c24', '#0b0c12', '#33354a', { b: '#4f8df7', p: '#9b72f2', k: '#d96570' }, [
    '.....b.....',
    '.....b.....',
    '....bbb....',
    '....bbb....',
    '..bbbbbpp..',
    'bbbbbbppppk',
    '..ppppppk..',
    '....ppk....',
    '....ppk....',
    '.....k.....',
    '.....k.....',
  ]),
  appIcon('Cursor', '#14120f', '#050403', '#2c2924', { l: '#ececec', m: '#9a9a9a', g: '#5a5a5a' }, [
    '...........',
    '.....l.....',
    '...lllll...',
    '.lllllllll.',
    '.mmlllllgg.',
    '.mmmmlgggg.',
    '.mmmmmgggg.',
    '.mmmmmgggg.',
    '..mmmmggg..',
    '....mmg....',
    '...........',
  ]),
  appIcon('VS Code', '#1f6fb8', '#124a80', '#4a94d8', { w: '#ffffff', l: '#9fd4f8' }, [
    '...........',
    '.......www.',
    '......wwww.',
    '.l...ww.ww.',
    '.ll.ww..ww.',
    '..lww...ww.',
    '.ll.ww..ww.',
    '.l...ww.ww.',
    '......wwww.',
    '.......www.',
    '...........',
  ]),
  appIcon('GitHub', '#24292f', '#111418', '#3a4048', { w: '#f0f3f6' }, [
    '...........',
    '..w.....w..',
    '..ww...ww..',
    '..wwwwwww..',
    '.wwwwwwwww.',
    '.wwwwwwwww.',
    '.wwwwwwwww.',
    '..wwwwwww..',
    '.w.wwwww...',
    '..ww.w.w...',
    '...........',
  ]),
  appIcon('After Effects', '#00005b', '#000033', '#1a1a80', { w: '#9999ff' }, letterGlyph('A', 'e')),
  appIcon('Photoshop', '#001e36', '#000f1c', '#0a3456', { w: '#31a8ff' }, letterGlyph('P', 's')),
  appIcon('Illustrator', '#330000', '#1c0000', '#4d1010', { w: '#ff9a00' }, letterGlyph('A', 'i')),
]

// One app icon with its top-left corner at x, y.
export function drawAppIcon(r, icon, x, y) {
  drawTile(r, icon.fill, icon.edge, x, y)
  r.hline(x + 2, y + 1, 11, icon.shine)
  r.sprite(icon.glyph, icon.key, x + 2, y + 2)
}

/*
  The lamp at the end of the top shelf, 20 × 26: the room's day/night switch. A red
  architect's lamp on a heavy base; when it's on (night) the bulb glows under
  the shade, when it's off (day) the bulb is dark.
*/
export const LAMP_SIZE = { w: 20, h: 26 }
export function drawLamp(r, on) {
  const metal = '#2a2a3c'
  const metalLit = '#4a4a66'
  // A two-pixel-thick arm from one joint to the next.
  const arm = (x0, y0, x1, y1) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
    for (let k = 0; k <= steps; k++) {
      const x = Math.round(x0 + ((x1 - x0) * k) / steps)
      const y = Math.round(y0 + ((y1 - y0) * k) / steps)
      r.px(x, y, metal)
      r.px(x + 1, y, metalLit)
    }
  }
  // Base, then the arm up to the elbow and over to the shade.
  r.rect(9, 23, 10, 3, metal)
  r.hline(10, 23, 8, metalLit)
  arm(13, 22, 16, 12)
  arm(16, 12, 9, 5)
  r.rect(15, 11, 3, 3, '#1c1c2a')
  // The shade: a dome opening downwards, lit along its top.
  const shade = '#a8322a'
  for (const [y, x1, x2] of [[3, 5, 9], [4, 4, 10], [5, 3, 11], [6, 2, 12]]) r.hline(x1, y, x2 - x1 + 1, shade)
  r.hline(5, 3, 4, '#d85a48')
  r.hline(4, 4, 3, '#d85a48')
  r.hline(2, 7, 11, '#6a1c18')
  // The bulb under the shade.
  r.hline(5, 8, 5, on ? '#fff2b0' : '#5a5560')
  if (on) r.hline(6, 9, 3, '#ffd27a')
}
