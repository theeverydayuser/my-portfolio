import { useEffect, useId, useRef } from 'react'
import { MOODS, SKINS } from './ai-blob-moods.js'
import styles from './AiBlob.module.css'

/*
  The NaXum assistant's mascot, alive: a React port of the VO's AiBlob.vue
  (laravel12_vo resources/js/components/AiBlob.vue), kept as close to it as React allows.
  It watches the pointer, blinks on its own, squishes when poked and wears its mood.

  The whole face is a vector of numbers and every number is a damped spring; a mood is a set
  of targets for those springs. One requestAnimationFrame loop drives them, and it sleeps the
  moment everything settles. It writes straight to the SVG (CSS custom properties and the
  mouth path) rather than through React state, so a moving blob never re-renders.
*/

/* Pokes inside this window (ms) count towards an overpoke, and this many is one too many. */
const POKE_WINDOW = 1600
const OVERPOKE_AT = 4
/* How long (ms) after the pointer goes quiet the eyes drift back to centre. */
const GAZE_IDLE_MS = 2600
/* Never integrate more than this at once (see AiBlob.vue: keeps the stiff blink springs stable). */
const MAX_SUBSTEP = 1 / 120
const MAX_FRAME = 0.05
const REST = 0.001

// The body: a gumdrop, 128 wide by 167 tall, its base centre (100, 176) every transform's origin.
const BODY = 'M 100 18 C 129 18 151 47 158 85 C 165 121 176 149 176 163 C 176 177 146 185 100 185 C 54 185 24 177 24 163 C 24 149 35 121 42 85 C 49 47 71 18 100 18 Z'

const spring = (value, stiffness, damping, mass = 1) => ({ value, target: value, velocity: 0, stiffness, damping, mass })

function step(s, dt) {
  const force = -s.stiffness * (s.value - s.target) - s.damping * s.velocity
  s.velocity += (force / s.mass) * dt
  s.value += s.velocity * dt
  if (Math.abs(s.velocity) < REST && Math.abs(s.value - s.target) < REST) {
    s.value = s.target
    s.velocity = 0
    return false
  }
  return true
}

const snap = (s) => {
  s.value = s.target
  s.velocity = 0
}

// The mouth: corners stay put while the middle curves, and it opens by splitting into two lips.
function mouthPath(width, curve, open, shift, tilt) {
  const f = (n) => n.toFixed(2)
  const cx = 100 + shift
  const half = width / 2
  const left = 106 + tilt / 2
  const right = 106 - tilt / 2
  const mid = 106 + curve * 7
  return `M ${f(cx - half)} ${f(left)} Q ${f(cx)} ${f(mid - open * 3)} ${f(cx + half)} ${f(right)} Q ${f(cx)} ${f(mid + open * 11)} ${f(cx - half)} ${f(left)} Z`
}

const r3 = (n) => Math.round(n * 1000) / 1000

export default function AiBlob({ mood = 'neutral', skin = 'blue', glasses = true, size = 96, label = '', className = '' }) {
  const svg = useRef(null)
  const mouth = useRef(null)
  const engine = useRef(null)
  const ids = useId().replace(/:/g, '')
  const id = (k) => `${ids}-${k}`

  // The engine: springs, loop, blinking, gaze and pokes. Built once per blob.
  useEffect(() => {
    const el = svg.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const face = Object.fromEntries(Object.keys(MOODS.neutral).map((key) => [key, spring(MOODS.neutral[key], 140, 18)]))
    const squash = spring(1, 320, 9)
    const gazeX = spring(0, 115, 24, 0.8)
    const gazeY = spring(0, 115, 24, 0.8)
    const blinkL = spring(1, 900, 42)
    const blinkR = spring(1, 900, 42)
    const all = [...Object.values(face), squash, gazeX, gazeY, blinkL, blinkR]
    let shakeAmp = 0
    let clock = 0
    let frame = 0
    let last = 0
    let running = false
    let pointer = { x: 0, y: 0 }
    // Scrolled out of view, it sleeps: no gaze or blinks to compute for nobody.
    let visible = true
    const timers = new Set()
    const pokes = []

    const after = (ms, fn) => {
      const t = setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
      return t
    }
    const cancel = (t) => {
      clearTimeout(t)
      timers.delete(t)
    }

    function writePose() {
      const f = {}
      for (const key in face) f[key] = face[key].value
      const sy = f.sy * squash.value
      const sx = f.sx * (1 + (1 - squash.value) * 0.9)
      const vars = {
        '--blob-sx': r3(sx),
        '--blob-sy': r3(sy),
        '--blob-rot': `${r3(f.tilt + gazeX.value * 3 + shakeAmp * Math.sin(clock * 46))}deg`,
        '--blob-face-x': `${r3(gazeX.value * 5)}px`,
        '--blob-face-y': `${r3(gazeY.value * 3)}px`,
        '--blob-pupil-x': `${r3(gazeX.value * 3.5)}px`,
        '--blob-pupil-y': `${r3(gazeY.value * 2.5)}px`,
        '--blob-eye-l': r3(f.eyeOpen * blinkL.value),
        '--blob-eye-r': r3(f.eyeOpen * blinkR.value),
        '--blob-eye-size': r3(f.eyeSize),
        '--blob-brow-y': `${r3(f.browY)}px`,
        '--blob-brow-a': `${r3(f.browA)}deg`,
        '--blob-brow-o': r3(f.browO),
        '--blob-brow-asym': `${r3(f.browAsym)}px`,
        '--blob-cheek-o': r3(f.cheek),
        '--blob-heat': r3(f.heat),
        '--blob-arm-l': `${r3(f.armL)}deg`,
        '--blob-arm-r': `${r3(f.armR)}deg`,
        '--blob-shadow-s': r3(sx),
      }
      for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v)
      mouth.current?.setAttribute('d', mouthPath(f.mouthW, f.mouthC, f.mouthO, f.mouthX, f.mouthTilt))
    }

    function tick(now) {
      const dt = last ? Math.min(MAX_FRAME, Math.max(0, (now - last) / 1000)) : 1 / 60
      last = now
      clock += dt
      let moving = false
      for (let left = dt; left > 0; left -= MAX_SUBSTEP) {
        const h = Math.min(MAX_SUBSTEP, left)
        for (const s of all) moving = step(s, h) || moving
      }
      for (const s of all) if (!Number.isFinite(s.value) || !Number.isFinite(s.velocity)) snap(s)
      if (shakeAmp > 0.02) {
        shakeAmp *= Math.exp(-dt * 5)
        moving = true
      } else shakeAmp = 0
      writePose()
      if (moving) frame = requestAnimationFrame(tick)
      else {
        running = false
        last = 0
      }
    }

    function settle() {
      for (const s of all) snap(s)
      shakeAmp = 0
      writePose()
    }

    function wake() {
      if (reduced) return settle()
      if (running) return
      running = true
      last = 0
      frame = requestAnimationFrame(tick)
    }

    function retargetGaze() {
      gazeX.target = pointer.x * face.look.target
      gazeY.target = pointer.y * face.look.target
    }

    function applyMood(name, instant = false) {
      const targets = MOODS[name] ?? MOODS.neutral
      for (const key in targets) face[key].target = targets[key]
      retargetGaze()
      if (instant) settle()
      else wake()
    }

    let gazeIdle = 0
    function onPointerMove(event) {
      if (event.pointerType === 'touch' || !visible) return
      const rect = el.getBoundingClientRect()
      const w = rect.width || 1
      const h = rect.height || 1
      pointer = {
        x: Math.tanh(((event.clientX - (rect.left + w / 2)) / w) * 0.9),
        y: Math.tanh(((event.clientY - (rect.top + h * 0.5)) / h) * 0.9),
      }
      retargetGaze()
      wake()
      cancel(gazeIdle)
      gazeIdle = after(GAZE_IDLE_MS, () => {
        pointer = { x: 0, y: 0 }
        retargetGaze()
        wake()
      })
    }

    let blinkOpen = 0
    function blinkOnce(wink = false) {
      for (const lid of wink ? [Math.random() < 0.5 ? blinkL : blinkR] : [blinkL, blinkR]) lid.target = 0.04
      wake()
      cancel(blinkOpen)
      blinkOpen = after(90, () => {
        blinkL.target = 1
        blinkR.target = 1
        wake()
      })
    }
    // Random, like a person: mostly single blinks, a fifth doubles, one in ten a wink.
    function scheduleBlink() {
      after(2000 + Math.random() * 3000, () => {
        if (visible && !document.hidden && face.eyeOpen.target > 0.3) {
          const roll = Math.random()
          if (roll < 0.1) blinkOnce(true)
          else if (roll < 0.3) {
            blinkOnce()
            after(220, () => blinkOnce())
          } else blinkOnce()
        }
        scheduleBlink()
      })
    }

    // A poke squishes it; four inside the window and it shakes, cross.
    function onPoke() {
      squash.velocity -= 7
      wake()
      const now = Date.now()
      pokes.push(now)
      while (pokes.length && now - pokes[0] > POKE_WINDOW) pokes.shift()
      if (pokes.length >= OVERPOKE_AT) {
        pokes.length = 0
        shakeAmp = 7
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        running = false
        last = 0
      } else wake()
    }

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    seen.observe(el)

    applyMood(mood, true)
    el.addEventListener('pointerdown', onPoke)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      scheduleBlink()
    }
    engine.current = { applyMood }

    return () => {
      cancelAnimationFrame(frame)
      seen.disconnect()
      for (const t of timers) clearTimeout(t)
      timers.clear()
      el.removeEventListener('pointerdown', onPoke)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      engine.current = null
    }
    // The engine is built once; mood changes go through applyMood below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engine.current?.applyMood(mood)
  }, [mood])

  const s = SKINS[skin] ?? SKINS.blue
  const skinVars = {
    '--blob-size': typeof size === 'number' ? `${size}px` : size,
    '--_skin-top': s.top,
    '--_skin-hi': s.hi,
    '--_skin': s.base,
    '--_skin-deep': s.deep,
    '--_rim-hi': s.rimHi,
    '--_rim': s.rim,
    '--_rim-deep': s.rimDeep,
    '--_bounce': s.bounce,
    '--_shade': s.shade,
    '--_ink': s.ink,
  }

  return (
    <svg ref={svg} className={`${styles.blob} ${className}`} style={skinVars} viewBox="0 0 200 200" role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'}>
      <defs>
        {/* Body lit from the upper left; rim light; bounce light off the floor; fresnel shade; contact shadow; heat. */}
        <radialGradient id={id('skin')} cx="0.36" cy="0.2" r="0.96">
          <stop offset="0" style={{ stopColor: 'var(--_skin-top)' }} />
          <stop offset="0.34" style={{ stopColor: 'var(--_skin-hi)' }} />
          <stop offset="0.72" style={{ stopColor: 'var(--_skin)' }} />
          <stop offset="1" style={{ stopColor: 'var(--_skin-deep)' }} />
        </radialGradient>
        <linearGradient id={id('rim')} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--_rim-hi)' }} />
          <stop offset="0.45" style={{ stopColor: 'var(--_rim)' }} />
          <stop offset="1" style={{ stopColor: 'var(--_rim-deep)' }} />
        </linearGradient>
        <radialGradient id={id('bounce')} cx="0.5" cy="1" r="0.72">
          <stop offset="0" style={{ stopColor: 'var(--_bounce)' }} stopOpacity="0.85" />
          <stop offset="0.55" style={{ stopColor: 'var(--_bounce)' }} stopOpacity="0.28" />
          <stop offset="1" style={{ stopColor: 'var(--_bounce)' }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0.42" />
          <stop offset="0.3" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0" />
          <stop offset="0.72" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0" />
          <stop offset="1" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0.34" />
        </linearGradient>
        <radialGradient id={id('floor')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0.55" />
          <stop offset="0.6" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0.2" />
          <stop offset="1" style={{ stopColor: 'var(--_shade)' }} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('heat')} cx="0.5" cy="0.15" r="0.9">
          <stop offset="0" stopColor="#ef4444" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('clip')}>
          <path d={BODY} />
        </clipPath>
      </defs>

      <ellipse className={styles.floor} cx="100" cy="190" rx="68" ry="9" fill={`url(#${id('floor')})`} />

      {/* Three nested groups, one transform owner each: CSS sway, JS pose, CSS breathing. */}
      <g className={styles.sway}>
        <g className={styles.pose}>
          <g className={styles.breathe}>
            <g className={`${styles.arm} ${styles.armL}`}>
              <ellipse className={styles.armBob} cx="34" cy="124" rx="14" ry="9" />
            </g>
            <g className={`${styles.arm} ${styles.armR}`}>
              <ellipse className={styles.armBob} cx="166" cy="124" rx="14" ry="9" />
            </g>

            <path className={styles.skin} d={BODY} fill={`url(#${id('skin')})`} stroke={`url(#${id('rim')})`} />

            <g clipPath={`url(#${id('clip')})`}>
              <ellipse cx="100" cy="184" rx="78" ry="46" fill={`url(#${id('bounce')})`} />
              <rect x="24" y="18" width="152" height="167" fill={`url(#${id('shade')})`} />
              <path className={styles.heat} d={BODY} fill={`url(#${id('heat')})`} />
            </g>

            <ellipse className={styles.gloss} cx="71" cy="45" rx="16" ry="8" transform="rotate(-38 71 45)" />
            <ellipse className={`${styles.gloss} ${styles.glossSm}`} cx="58" cy="64" rx="4.5" ry="3" transform="rotate(-38 58 64)" />

            <g className={styles.face}>
              <ellipse className={styles.cheek} cx="54" cy="97" rx="9" ry="4.5" />
              <ellipse className={styles.cheek} cx="146" cy="97" rx="9" ry="4.5" />

              <g className={`${styles.brow} ${styles.browL}`}>
                <path d="M 56 65 Q 71 54 88 58 Q 72 60 56 67 Z" />
              </g>
              <g className={`${styles.brow} ${styles.browR}`}>
                <path d="M 144 65 Q 129 54 112 58 Q 128 60 144 67 Z" />
              </g>

              {/* The iris travels inside a fixed eye, so the gaze reads as looking, not googly. */}
              <g className={`${styles.eye} ${styles.eyeL}`}>
                <ellipse className={styles.sclera} cx="73" cy="84" rx="10.6" ry="8.6" />
                <g className={styles.iris}>
                  <ellipse cx="73" cy="84.6" rx="6.2" ry="6.9" />
                  <circle className={styles.glint} cx="70.4" cy="81.4" r="2.5" />
                  <circle className={`${styles.glint} ${styles.glintSm}`} cx="75.6" cy="87.2" r="1.15" />
                </g>
              </g>
              <g className={`${styles.eye} ${styles.eyeR}`}>
                <ellipse className={styles.sclera} cx="127" cy="84" rx="10.6" ry="8.6" />
                <g className={styles.iris}>
                  <ellipse cx="127" cy="84.6" rx="6.2" ry="6.9" />
                  <circle className={styles.glint} cx="124.4" cy="81.4" r="2.5" />
                  <circle className={`${styles.glint} ${styles.glintSm}`} cx="129.6" cy="87.2" r="1.15" />
                </g>
              </g>

              {glasses && (
                <g className={styles.glasses}>
                  <rect className={styles.lens} x="57" y="71" width="32" height="26" rx="8.5" />
                  <rect className={styles.lens} x="111" y="71" width="32" height="26" rx="8.5" />
                  <path className={styles.frame} d="M 89 80 Q 100 77.5 111 80" />
                  <path className={styles.frame} d="M 57 78 L 46 74.5" />
                  <path className={styles.frame} d="M 143 78 L 154 74.5" />
                </g>
              )}

              <path ref={mouth} className={styles.mouth} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
