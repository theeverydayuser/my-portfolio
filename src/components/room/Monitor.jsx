import { forwardRef, useEffect, useRef, useState } from 'react'
import { demos } from '../../data/demos.js'
import { works } from '../../data/works.js'
import { place } from './scene.js'
import styles from './Room.module.css'

/*
  The monitor's screen. Plays the demo clips in src/data/demos.js, one after another,
  and only while the monitor is on screen (clips load on demand, so the page stays fast).
  Windows minimise into it, so it carries the ref Window.jsx animates towards.
*/
const Monitor = forwardRef(function Monitor({ L, preview, reel, onOpen }, ref) {
  const { x, y, w, h } = L.screen
  const style = place({ left: x, top: y, width: w, height: h }, L)
  const showing = useReel(reel && !preview)
  // An upright (phone) screen: videos fit its width, and the caption moves to the top,
  // clear of the person sitting in front of it.
  const upright = h > w

  // Touch screens can't hover a book, so the monitor runs through the works on its own;
  // tapping it opens the one on screen.
  if (reel && !preview) {
    return (
      <button
        ref={ref}
        type="button"
        className={styles.monitor}
        style={style}
        aria-label={`${showing.title}: ${showing.subtitle}. Open it`}
        onClick={(event) => onOpen(showing.id, event.currentTarget)}
      >
        <WorkPreview work={showing} hint="tap to open" upright={upright} />
        <span className={styles.scanlines} aria-hidden="true" />
      </button>
    )
  }

  return (
    <div ref={ref} className={styles.monitor} style={style}>
      {preview ? <WorkPreview work={preview} upright={upright} /> : demos.length ? <DemoReel /> : <Intro />}
      <span className={styles.scanlines} aria-hidden="true" />
    </div>
  )
})

// How long each work stays on the self-running monitor: longer when it has a video.
const REEL_MS = { video: 12000, card: 5000 }

// Steps through the works while `running` (background tabs slow the timer down on their own).
function useReel(running) {
  const [index, setIndex] = useState(0)
  const work = works[index % works.length]
  useEffect(() => {
    if (!running) return
    const timer = setTimeout(() => setIndex((i) => i + 1), work.preview ? REEL_MS.video : REEL_MS.card)
    return () => clearTimeout(timer)
  }, [running, index, work.preview])
  return work
}

export default Monitor

/*
  A book is being looked at: play its preview (muted, looping), or show a title card when it
  has none yet. The caption names the work and how to open it.
*/
function WorkPreview({ work, hint = 'click the book to open', upright = false }) {
  return (
    <div className={`${styles.preview} ${upright ? styles.upright : ''}`} key={work.id}>
      {work.preview ? (
        <video className={`${styles.video} ${upright ? styles.videoFit : ''}`} src={work.preview.src} poster={work.preview.poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      ) : (
        <div className={styles.titleCard} aria-hidden="true">
          <span className={styles.titleCardName}>{work.title}</span>
          <span>{work.subtitle}</span>
          <span className={styles.titleCardSoon}>preview coming soon</span>
        </div>
      )}
      <div className={styles.caption} aria-live="polite">
        <span>
          {work.title} · {work.subtitle}
        </span>
        <span className={styles.captionHint}>{hint}</span>
      </div>
    </div>
  )
}

function DemoReel() {
  const video = useRef(null)
  const [index, setIndex] = useState(0)
  const demo = demos[index]

  // Play only while visible; pause off screen to save battery and data.
  useEffect(() => {
    const el = video.current
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {})
      else el.pause()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <video
      ref={video}
      key={demo.src}
      className={styles.video}
      src={demo.src}
      poster={demo.poster}
      muted
      playsInline
      preload="none"
      loop={demos.length === 1}
      onEnded={() => setIndex((i) => (i + 1) % demos.length)}
      aria-label={demo.title}
    />
  )
}

// Before a book is looked at: who Mide is, big in the middle of the screen.
function Intro() {
  return (
    <div className={styles.intro}>
      <p className={styles.introName}>Mide Samuel</p>
      <p className={styles.introRole}>Design Engineer</p>
      <p className={styles.introSkills}>Designing AI Products · Building AI Interfaces · Shipping AI to Production</p>
      <p className={styles.introHint}>▸ hover a book to see the work</p>
    </div>
  )
}
