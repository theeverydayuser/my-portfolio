import { useEffect, useState } from 'react'
import { toggleMusic, useMusicPlaying } from '../../music/music.js'
import { TURNTABLE_SIZE, drawTurntable } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { pctX, pctY } from './scene.js'
import styles from './Room.module.css'

const FRAME_MS = 180

const frameUrl = (frame) => spriteUrl(`turntable-${frame}`, TURNTABLE_SIZE.w, TURNTABLE_SIZE.h, (r) => drawTurntable(r, frame))

/*
  The record player: shows whether the background music (music/music.js) is playing and
  toggles it. While it plays, the record turns and notes drift up.
*/
export default function MusicPlayer({ L }) {
  const playing = useMusicPlaying()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setFrame((f) => (f + 1) % 4), FRAME_MS)
    return () => clearInterval(timer)
  }, [playing])

  const label = playing ? 'Stop the music' : 'Play some music'

  return (
    <button
      type="button"
      className={`${styles.standing} ${styles.opener} ${styles.player}`}
      style={{ left: pctX(L.player.x, L), top: pctY(L.player.y, L), width: pctX(TURNTABLE_SIZE.w, L) }}
      aria-label={label}
      aria-pressed={playing}
      data-music-toggle
      onClick={toggleMusic}
    >
      <img className={styles.objectArt} src={frameUrl(playing ? frame : null)} width={TURNTABLE_SIZE.w} height={TURNTABLE_SIZE.h} alt="" draggable="false" />
      {playing && (
        <span className={styles.notes} aria-hidden="true">
          <span>♪</span>
          <span>♫</span>
          <span>♪</span>
        </span>
      )}
      <span className={styles.tip}>{label}</span>
    </button>
  )
}
