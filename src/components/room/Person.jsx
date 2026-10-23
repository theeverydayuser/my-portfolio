import { useEffect, useRef, useState } from 'react'
import { HEAD, HEAD_TURNS, PERSON_BODY, drawHead, drawPersonBody } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { pctX, pctY } from './scene.js'
import styles from './Room.module.css'

// How far (as a share of the screen) the pointer must be from the head for a full turn.
const REACH = 0.32
// Eased toward the target each frame, then rounded to a drawn turn, so it turns smoothly.
const EASE = 0.18
// With no pointer movement for this long, look back at the monitor (with the odd glance).
const IDLE_MS = 3500

const bodyUrl = () => spriteUrl('person-body', PERSON_BODY.w, PERSON_BODY.h, drawPersonBody)
const headUrl = (turn, tilt) => spriteUrl(`head-${turn}-${tilt}`, HEAD.w, HEAD.h, (r) => drawHead(r, turn, tilt))

/*
  Mide at the desk, seen from behind. The head turns toward the mouse (or the last tap on a
  phone); left alone, it goes back to the monitor and now and then glances round the room.
  It sits between the room and the chair canvases, so the chair's back hides the body.
*/
export default function Person({ L, onOpen }) {
  const headRef = useRef(null)
  const [pose, setPose] = useState({ turn: 0, tilt: 0 })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = { x: 0, y: 0 }
    let current = { x: 0, y: 0 }
    let lastMove = 0
    let glance = null
    let frame = 0

    const aim = (event) => {
      const head = headRef.current?.getBoundingClientRect()
      if (!head) return
      const reach = Math.max(window.innerWidth, 1) * REACH
      target = {
        x: Math.max(-1, Math.min(1, (event.clientX - (head.left + head.width / 2)) / reach)),
        y: Math.max(-1, Math.min(1, (event.clientY - (head.top + head.height / 2)) / reach)),
      }
      lastMove = performance.now()
    }

    const step = (now) => {
      // Idle: face the monitor, with a short glance one way or the other every few seconds.
      if (now - lastMove > IDLE_MS) {
        if (!glance || now > glance.until) glance = { until: now + 1400 + Math.random() * 4000, x: Math.random() < 0.35 ? (Math.random() * 2 - 1) * 0.7 : 0 }
        target = { x: glance.x, y: 0 }
      }
      current = reduced ? target : { x: current.x + (target.x - current.x) * EASE, y: current.y + (target.y - current.y) * EASE }
      const turn = Math.round(current.x * HEAD_TURNS)
      const tilt = current.y < -0.35 ? -1 : current.y > 0.45 ? 1 : 0
      setPose((p) => (p.turn === turn && p.tilt === tilt ? p : { turn, tilt }))
      frame = requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', aim, { passive: true })
    window.addEventListener('pointerdown', aim, { passive: true })
    frame = requestAnimationFrame(step)
    return () => {
      window.removeEventListener('pointermove', aim)
      window.removeEventListener('pointerdown', aim)
      cancelAnimationFrame(frame)
    }
  }, [])

  const body = { x: L.person.x - (PERSON_BODY.w >> 1), y: L.person.y - PERSON_BODY.h }
  // The head rests on the neck; tilting moves it a pixel up or down.
  const head = { x: L.person.x - 13, y: body.y - HEAD.h + 5 + pose.tilt }

  return (
    <button
      type="button"
      className={styles.person}
      style={{ left: pctX(body.x, L), top: pctY(head.y, L), width: pctX(PERSON_BODY.w, L), height: pctY(body.y + PERSON_BODY.h - head.y, L) }}
      aria-label="That's me. Open About Me"
      onClick={(event) => onOpen('about-me', event.currentTarget)}
    >
      <img className={styles.personPart} src={bodyUrl()} alt="" draggable="false" style={{ left: 0, bottom: 0, width: '100%' }} />
      <img
        ref={headRef}
        className={styles.personPart}
        src={headUrl(pose.turn, pose.tilt)}
        alt=""
        draggable="false"
        style={{ left: `${((head.x - body.x) / PERSON_BODY.w) * 100}%`, top: 0, width: `${(HEAD.w / PERSON_BODY.w) * 100}%` }}
      />
      {/* The "About Me" callout stays up over Mide. */}
      <span className={styles.aboutBubble} aria-hidden="true">
        About Me
      </span>
    </button>
  )
}
