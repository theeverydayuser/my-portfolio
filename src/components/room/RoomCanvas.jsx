import { useEffect, useRef } from 'react'
import { createRaster } from '../../room-art/raster.js'
import { drawChairLayer, drawRoom } from '../../room-art/draw-room.js'
import { NIGHT } from '../../room-art/palette.js'
import styles from './Room.module.css'

// The portrait's pixels, read once per file (it's painted into the room, behind the plant).
const portraits = new Map()
function loadPortrait(src) {
  if (!portraits.has(src)) {
    portraits.set(
      src,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const c = document.createElement('canvas')
          c.width = img.width
          c.height = img.height
          const ctx = c.getContext('2d')
          ctx.drawImage(img, 0, 0)
          resolve({ w: img.width, h: img.height, data: ctx.getImageData(0, 0, img.width, img.height).data })
        }
        img.onerror = () => resolve(null)
        img.src = src
      }),
    )
  }
  return portraits.get(src)
}

// How often the city's windows twinkle (the whole room is redrawn; it's ~100k pixels).
const TWINKLE_MS = 800

/*
  The room itself: drawn in code into a canvas at its native pixel size, then scaled up by
  CSS with crisp pixels. Redraws when the layout changes, and gently for the twinkling city.
*/
export default function RoomCanvas({ L }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const raster = createRaster(L.W, L.H)
    const image = new ImageData(raster.data, L.W, L.H)
    const art = {}
    let live = true
    const paint = () => {
      drawRoom(raster, L, NIGHT, performance.now(), art)
      ctx.putImageData(image, 0, 0)
    }
    paint()
    if (L.portrait) {
      loadPortrait(L.portrait.src).then((pixels) => {
        art.portrait = pixels
        if (live) paint()
      })
    }
    const animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = animate
      ? setInterval(() => {
          if (!document.hidden) paint()
        }, TWINKLE_MS)
      : 0
    return () => {
      live = false
      clearInterval(timer)
    }
  }, [L])

  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}

// The chair, on a transparent canvas in front of the person sitting in it. Drawn once per layout.
export function ChairCanvas({ L }) {
  const ref = useRef(null)
  useEffect(() => {
    const raster = createRaster(L.W, L.H)
    drawChairLayer(raster, L, NIGHT)
    ref.current.getContext('2d').putImageData(new ImageData(raster.data, L.W, L.H), 0, 0)
  }, [L])
  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}
