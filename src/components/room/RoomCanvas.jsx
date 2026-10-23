import { useEffect, useRef } from 'react'
import { createRaster } from '../../room-art/raster.js'
import { drawChairLayer, drawRoom } from '../../room-art/draw-room.js'
import { DAY, NIGHT } from '../../room-art/palette.js'
import styles from './Room.module.css'

// ImageData can't be 0 (or NaN) pixels in either direction, so a room with no size isn't drawn.
const hasSize = (L) => L.W > 0 && L.H > 0

/*
  The room itself: drawn in code into a canvas at its native pixel size, then scaled up by
  CSS with crisp pixels. Redraws when the layout or day/night changes.
*/
export default function RoomCanvas({ L, day }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!hasSize(L)) return
    const ctx = ref.current.getContext('2d')
    const raster = createRaster(L.W, L.H)
    drawRoom(raster, L, day ? DAY : NIGHT)
    ctx.putImageData(new ImageData(raster.data, L.W, L.H), 0, 0)
  }, [L, day])

  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}

// The chair, on a transparent canvas in front of the person sitting in it. Drawn once per layout.
export function ChairCanvas({ L, day }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!hasSize(L)) return
    const raster = createRaster(L.W, L.H)
    drawChairLayer(raster, L, day ? DAY : NIGHT)
    ref.current.getContext('2d').putImageData(new ImageData(raster.data, L.W, L.H), 0, 0)
  }, [L, day])
  return <canvas ref={ref} className={styles.canvas} width={L.W} height={L.H} aria-hidden="true" />
}
