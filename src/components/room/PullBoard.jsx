import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { testimonials } from '../../data/testimonials.js'
import { noteStyle } from './kind-words.js'
import { place } from './scene.js'
import styles from './PullBoard.module.css'

/*
  Phones: the "Kind words" board isn't on the wall, it's rolled up above the screen. A cord
  with a round pull hangs from the beam; pull it down and the board comes down with it,
  following the finger; swipe the board up (or pull its ring up) and it rolls away again.
  A tap on either ring opens or closes it too, and Escape closes it.
*/

// How far the open/close drag must go (as a share of the board's height) to carry on by itself.
const COMMIT = 0.2
// Movement (CSS px) before a press counts as a drag rather than a tap.
const SLOP = 6
// The cord stretches this far (CSS px) at most while pulled; the board keeps following.
const MAX_STRETCH = 56

export default function PullBoard({ L, onOpen }) {
  // 0 rolled up … 1 fully down.
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const board = useRef(null)
  const drag = useRef(null)
  // Whether the last press was a drag: the click that follows it mustn't count as a tap.
  const dragged = useRef(false)
  const open = progress === 1

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setProgress(0)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const height = () => board.current?.offsetHeight || window.innerHeight * 0.8

  // A press on the cord's ring or on the board: once it moves, the board follows the finger
  // (the pointer is only captured then, so a plain tap still reaches the note or ring under it).
  const onPointerDown = (event) => {
    drag.current = { y: event.clientY, from: progress, moved: false }
    dragged.current = false
  }
  const onPointerMove = (event) => {
    const d = drag.current
    if (!d) return
    const dy = event.clientY - d.y
    if (!d.moved) {
      if (Math.abs(dy) < SLOP) return
      d.moved = true
      dragged.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    setProgress(Math.min(1, Math.max(0, d.from + dy / height())))
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d?.moved) return
    setProgress((p) => (d.from === 0 ? (p > COMMIT ? 1 : 0) : p < 1 - COMMIT ? 0 : 1))
  }
  const drags = { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }

  // A tap on a ring opens or closes the board; the click that ends a drag does nothing.
  const toggle = () => {
    if (dragged.current) return
    setProgress((p) => (p > 0.5 ? 0 : 1))
  }

  const stretch = open ? 0 : Math.min(MAX_STRETCH, progress * height())
  const { x, y, length } = L.pullCord

  return (
    <>
      <div className={`${styles.cord} ${progress > 0 ? styles.held : ''}`} style={{ ...place({ left: x, top: y, width: 0, height: length }, L), '--stretch': `${stretch}px` }}>
        <span className={styles.string} aria-hidden="true" />
        <button type="button" className={styles.ring} aria-label="Pull down the Kind words board" aria-expanded={open} aria-controls="kind-words-board" onClick={toggle} {...drags} />
      </div>
      {createPortal(
        <section
          id="kind-words-board"
          ref={board}
          className={`${styles.board} ${dragging ? styles.dragging : ''}`}
          style={{ '--progress': progress }}
          aria-label="Kind words from people I've worked with"
          aria-hidden={progress === 0}
          inert={progress === 0 ? '' : undefined}
          {...drags}
        >
          <span className={styles.rail} aria-hidden="true" />
          <h2 className={styles.header}>Kind words</h2>
          <ul className={styles.notes}>
            {testimonials.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={styles.note}
                  style={noteStyle(i)}
                  aria-label={`${t.name}: ${t.excerpt} Read all the recommendations`}
                  onClick={(event) => !dragged.current && onOpen('testimonials', event.currentTarget)}
                >
                  <span className={styles.pin} aria-hidden="true" />
                  <span className={styles.quote}>“{t.excerpt}”</span>
                  <span className={styles.name}>{t.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.hint} aria-hidden="true">
            Swipe up to roll it away
          </p>
          <span className={styles.rail} aria-hidden="true" />
          <span className={styles.bottomCord} aria-hidden="true">
            <span className={styles.string} />
          </span>
          <button type="button" className={`${styles.ring} ${styles.bottomRing}`} aria-label="Roll the Kind words board back up" onClick={toggle} />
        </section>,
        document.body,
      )}
    </>
  )
}
