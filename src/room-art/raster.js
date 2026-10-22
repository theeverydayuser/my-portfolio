/*
  A tiny pixel canvas: an RGBA buffer plus the few drawing tools pixel art needs.
  No DOM: the browser copies the buffer into a <canvas>, and node can render it to a PNG
  for previews, from the same code.

  Colours are hex strings ('#2a2230'), parsed once and cached.
*/
const cache = new Map()
export function rgb(hex) {
  let c = cache.get(hex)
  if (!c) {
    const n = parseInt(hex.slice(1), 16)
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    cache.set(hex, c)
  }
  return c
}

// 4×4 ordered-dither thresholds: the classic way pixel art blends two colours without new ones.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
export const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)]

export function createRaster(w, h) {
  const data = new Uint8ClampedArray(w * h * 4)

  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h

  function px(x, y, hex) {
    x |= 0
    y |= 0
    if (!inside(x, y)) return
    const [r, g, b] = rgb(hex)
    const i = (y * w + x) * 4
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }

  // Mix a colour over what's there (for glows and shadows).
  function blend(x, y, hex, alpha) {
    x |= 0
    y |= 0
    if (!inside(x, y) || alpha <= 0) return
    const [r, g, b] = rgb(hex)
    const i = (y * w + x) * 4
    const a = Math.min(alpha, 1)
    data[i] += (r - data[i]) * a
    data[i + 1] += (g - data[i + 1]) * a
    data[i + 2] += (b - data[i + 2]) * a
    data[i + 3] = 255
  }

  function rect(x, y, rw, rh, hex) {
    for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) px(x + i, y + j, hex)
  }

  function blendRect(x, y, rw, rh, hex, alpha) {
    for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) blend(x + i, y + j, hex, alpha)
  }

  const hline = (x, y, len, hex) => rect(x, y, len, 1, hex)
  const vline = (x, y, len, hex) => rect(x, y, 1, len, hex)

  // Vertical gradient through a list of colours, dithered between neighbours (no smooth blends).
  function gradientV(x, y, rw, rh, colours) {
    const steps = colours.length - 1
    for (let j = 0; j < rh; j++) {
      const t = rh === 1 ? 0 : (j / (rh - 1)) * steps
      const band = Math.min(Math.floor(t), steps - 1)
      const f = t - band
      for (let i = 0; i < rw; i++) px(x + i, y + j, f > bayer(x + i, y + j) ? colours[band + 1] : colours[band])
    }
  }

  // Light falling off with distance from a horizontal source line, dithered into bands.
  function glowDown(x, y, rw, rh, hex, strength) {
    for (let j = 0; j < rh; j++) {
      const fall = strength * (1 - j / rh) ** 2
      for (let i = 0; i < rw; i++) {
        const edge = Math.min(i, rw - 1 - i) / Math.max(4, rw * 0.08)
        blend(x + i, y + j, hex, fall * Math.min(1, edge))
      }
    }
  }

  // A pixel map: rows of characters, each mapped to a colour by `key` ('.' is transparent).
  function sprite(rows, key, x, y, flip = false) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[flip ? row.length - 1 - i : i]
        if (ch !== '.' && key[ch]) px(x + i, y + j, key[ch])
      }
    })
  }

  return { w, h, data, px, blend, rect, blendRect, hline, vline, gradientV, glowDown, sprite }
}

// Small seeded random numbers, so the city and book spines look the same on every render.
export function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
