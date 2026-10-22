import { createRaster } from './raster.js'

// Draws a sprite once into an off-screen canvas and returns it as an image URL (cached by key).
const urls = new Map()
export function spriteUrl(key, w, h, draw) {
  let url = urls.get(key)
  if (!url) {
    const r = createRaster(w, h)
    draw(r)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').putImageData(new ImageData(r.data, w, h), 0, 0)
    url = canvas.toDataURL()
    urls.set(key, url)
  }
  return url
}
