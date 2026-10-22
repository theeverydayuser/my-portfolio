import { useEffect, useRef } from 'react'
import { createRaster } from '../../room-art/raster.js'
import { drawChairLayer, drawRoom } from '../../room-art/draw-room.js'
import { DAY, NIGHT } from '../../room-art/palette.js'
import styles from './Room.module.css'

// Mide's picture, square, loaded once. The room paints it at whatever size the frame is.
const PORTRAIT_SRC = '/assets/room/mide-portrait.jpg'
// Where the face is, across the picture: a narrow frame is cropped around it.
const FACE_X = 0.52
let portraitImage = null
const loadPortraitImage = () =>
  (portraitImage ??= new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = PORTRAIT_SRC
  }))

// The picture as room pixels at w × h: it fills the frame (cropped around the face) and is
// shrunk to the room's pixel grid, which is what makes it pixel art.
async function portraitPixels(w, h) {
  const img = await loadPortraitImage()
  if (!img) return null
  const side = Math.min(img.width, img.height)
  const crop = w / h < 1 ? { w: side * (w / h), h: side } : { w: side, h: side * (h / w) }
  const sx = Math.min(Math.max(img.width * FACE_X - crop.w / 2, 0), img.width - crop.w)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, 0, crop.w, crop.h, 0, 0, w, h)
  return { w, h, data: ctx.getImageData(0, 0, w, h).data }
}

/*
  The room itself: drawn in code into a canvas at its native pixel size, then scaled up by
  CSS with crisp pixels. Redraws when the layout or day/night changes, and once more when
  the portrait is ready.
*/
export default function RoomCanvas({ L, day }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    const raster = createRaster(L.W, L.H)
    const image = new ImageData(raster.data, L.W, L.H)
    const art = {}
    let live = true
    const paint = () => {
      drawRoom(raster, L, day ? DAY : NIGHT, art)
      ctx.putImageData(image, 0, 0)
    }
    paint()
    if (L.portrait) {
      portraitPixels(L.portrait.w - 4, L.portrait.h - 4).then((pixels) => {
        art.portrait = pixels
        if (live) paint()
      })
    }
    return () => {
      live = false
    }
  }, [L, day])

  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}

// The chair, on a transparent canvas in front of the person sitting in it. Drawn once per layout.
export function ChairCanvas({ L, day }) {
  const ref = useRef(null)
  useEffect(() => {
    const raster = createRaster(L.W, L.H)
    drawChairLayer(raster, L, day ? DAY : NIGHT)
    ref.current.getContext('2d').putImageData(new ImageData(raster.data, L.W, L.H), 0, 0)
  }, [L, day])
  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}
