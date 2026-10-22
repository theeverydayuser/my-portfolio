import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import styles from './Window.module.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Transform that makes the window sit exactly over a target rectangle (an icon, or its dock slot).
function rectTransform(windowEl, rect) {
  const w = windowEl.getBoundingClientRect()
  return `translate(${rect.left - w.left}px, ${rect.top - w.top}px) scale(${rect.width / w.width}, ${rect.height / w.height})`
}

// Minimised windows shrink to a small square in the middle of their target (the monitor).
function minimizeSlot(targetEl) {
  const t = targetEl.getBoundingClientRect()
  const size = Math.min(t.width, t.height) * 0.4
  return { left: t.left + (t.width - size) / 2, top: t.top + (t.height - size) / 2, width: size, height: size }
}

// The menu bar is part of the screen windows can't slide under.
const menuBarHeight = () => document.querySelector('[data-menubar]')?.offsetHeight ?? 0

// Each window opened while others are showing steps this far down and to the right.
const CASCADE_STEP = 28

// `width` (design px) gives a narrower window that is only as tall as its content; `showTitle` hides the title-bar text.
// `position` ({ left, top }) opens the window at a set spot instead of centred.
// `closeRequest` changing asks the window to close (e.g. Window › Close Window in the menu bar).
export default function Window({ closeRequest, title, width, minWidth = 0, height, maxHeight, position, showTitle = true, origin, minimizeTo, minimized, cascade = 0, zIndex, active, onFocus, onMinimize, onClose, children }) {
  const ref = useRef(null)
  const closing = useRef(false)
  const titleId = useId()
  const zooms = Boolean(origin) && !reducedMotion()
  const [zoomed, setZoomed] = useState(false)

  // macOS-style open: the window grows out of the icon that was clicked.
  useLayoutEffect(() => {
    if (!zooms) return
    const animation = ref.current.animate(
      [
        { transform: rectTransform(ref.current, origin.getBoundingClientRect()), opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)' },
    )
    return () => animation.cancel()
  }, [zooms, origin])

  useEffect(() => {
    ref.current?.focus()
  }, [])

  // Minimise: shrink into the monitor, then hide (kept mounted so scroll position survives).
  // Restore: grow back out of it. Window › (its name) in the menu bar brings it back.
  const wasMinimized = useRef(minimized)
  useLayoutEffect(() => {
    const el = ref.current
    if (wasMinimized.current === minimized) return
    wasMinimized.current = minimized
    el.inert = minimized
    const target = minimizeTo.current
    if (!target || reducedMotion()) {
      if (minimized) {
        el.dataset.minimized = ''
      } else {
        delete el.dataset.minimized
        el.focus()
      }
      return
    }
    if (minimized) {
      const animation = el.animate(
        [{ transform: 'none', opacity: 1 }, { transform: rectTransform(el, minimizeSlot(target)), opacity: 0.2 }],
        { duration: 320, easing: 'cubic-bezier(0.55, 0, 0.75, 0.3)', fill: 'forwards' },
      )
      animation.onfinish = () => {
        el.dataset.minimized = ''
        animation.cancel()
      }
    } else {
      delete el.dataset.minimized
      el.animate(
        [{ transform: rectTransform(el, minimizeSlot(target)), opacity: 0.2 }, { transform: 'none', opacity: 1 }],
        { duration: 340, easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)' },
      )
      el.focus()
    }
  }, [minimized, minimizeTo])

  // Closing shrinks the window back into its icon, then unmounts it.
  const close = () => {
    if (closing.current) return
    closing.current = true
    if (!zooms || !origin.isConnected) return onClose()
    const animation = ref.current.animate(
      [
        { transform: 'none', opacity: 1 },
        { opacity: 1, offset: 0.7 },
        { transform: rectTransform(ref.current, origin.getBoundingClientRect()), opacity: 0 },
      ],
      { duration: 280, easing: 'cubic-bezier(0.5, 0, 0.75, 0.2)', fill: 'forwards' },
    )
    animation.onfinish = onClose
  }

  // Only react to close requests made after this window opened — a count left over
  // from an earlier visit would otherwise close a freshly reopened window at once.
  const initialCloseRequest = useRef(closeRequest)
  useEffect(() => {
    if (closeRequest !== initialCloseRequest.current) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequest])

  const onKeyDown = (event) => {
    if (event.key === 'Escape') close()
  }

  // Drag by the title bar, like a macOS window. Uses the `translate` property so it
  // doesn't fight the zoom animation, which runs on `transform`.
  const start = (cascade % 8) * CASCADE_STEP
  const offset = useRef({ x: start, y: start })
  const drag = useRef(null)

  const onDragStart = (event) => {
    if (zoomed || event.button !== 0 || event.target.closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      from: { ...offset.current },
      rect: ref.current.getBoundingClientRect(),
      minTop: menuBarHeight(),
    }
  }

  const onDragMove = (event) => {
    if (!drag.current) return
    const { x, y, from, rect, minTop } = drag.current
    // Keep the title bar reachable: at least 100px of the window stays on screen, never under the menu bar.
    const left = clamp(rect.left + event.clientX - x, 100 - rect.width, window.innerWidth - 100)
    const top = clamp(rect.top + event.clientY - y, minTop, window.innerHeight - 40)
    offset.current = { x: from.x + left - rect.left, y: from.y + top - rect.top }
    ref.current.style.translate = `${offset.current.x}px ${offset.current.y}px`
  }

  const onDragEnd = () => {
    drag.current = null
  }

  // Green button / double-clicking the title bar fills the screen below the menu bar.
  const toggleZoom = () => setZoomed((z) => !z)

  return (
    <div className={`${styles.layer} ${zoomed ? styles.layerZoomed : ''}`} style={{ zIndex }} data-window-layer>
      <section
        ref={ref}
        className={`${styles.window} ${width ? styles.compact : ''} ${position ? styles.placed : ''} ${zooms ? styles.zooms : ''} ${zoomed ? styles.zoomed : ''} ${active ? '' : styles.inactive}`}
        style={{
          translate: zoomed ? 'none' : `${offset.current.x}px ${offset.current.y}px`,
          // `minWidth` (px) keeps small windows wide enough on smaller laptops.
          ...(width && { '--window-max-w': `max(calc(${width} * var(--u)), ${minWidth}px)` }),
          ...(maxHeight && { '--window-max-h': maxHeight }),
          ...(height && { '--window-h': height }),
          ...(position && { '--window-left': position.left, '--window-top': position.top }),
        }}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-active={active}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onPointerDownCapture={onFocus}
        onFocus={onFocus}
      >
        <header
          className={styles.titleBar}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onDoubleClick={(event) => !event.target.closest('button') && toggleZoom()}
        >
          <div className={styles.lights}>
            <button type="button" className={`${styles.light} ${styles.red}`} onClick={close} aria-label="Close window">
              <svg viewBox="0 0 8 8" aria-hidden="true">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
              </svg>
            </button>
            <button type="button" className={`${styles.light} ${styles.yellow}`} onClick={onMinimize} aria-label="Minimize window">
              <svg viewBox="0 0 8 8" aria-hidden="true">
                <path d="M1.2 4h5.6" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.light} ${styles.green}`}
              onClick={toggleZoom}
              aria-label={zoomed ? 'Restore window size' : 'Zoom window'}
              aria-pressed={zoomed}
            >
              <svg viewBox="0 0 8 8" aria-hidden="true">
                <path className={styles.fill} d="M2 2.2h3.6L2 5.8zM6 5.8H2.4L6 2.2z" />
              </svg>
            </button>
          </div>
          <p id={titleId} className={`${styles.title} ${showTitle ? '' : styles.titleHidden}`}>{title}</p>
        </header>
        <header className={styles.mobileHeader}>
          <button type="button" className={styles.back} onClick={close} aria-label="Back to desktop">
            <svg viewBox="0 0 10 18" className={styles.backIcon} aria-hidden="true">
              <path d="M9 1L1 9l8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className={styles.mobileTitle} aria-hidden="true">{title}</p>
          {/* Small windows on phones float as cards with just a close button. */}
          <button type="button" className={styles.mobileClose} onClick={close} aria-label="Close window">
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  )
}
