import { useEffect, useId, useRef, useState } from 'react'
import styles from './Showcase.module.css'

/*
  A full-screen viewer for a body of work with many parts (NaXum first): a side nav of its
  works and achievements, and the chosen one beside it. It takes the place of a window, so it
  opens and closes like one: `closeRequest` changing (Window › Close Window) or Escape closes
  it, with a short zoom back. Data: src/data/showcases/.
*/
const CLOSE_MS = 180

export default function Showcase({ showcase, closeRequest, zIndex, active, onFocus, onClose }) {
  const items = showcase.groups.flatMap((g) => g.items)
  const [currentId, setCurrentId] = useState(items[0].id)
  const [closing, setClosing] = useState(false)
  // Phones only: the contents fold into a picker that drops down over the page.
  const [menuOpen, setMenuOpen] = useState(false)
  const root = useRef(null)
  const page = useRef(null)
  const titleId = useId()
  const navId = useId()
  const current = items.find((item) => item.id === currentId) ?? items[0]

  const close = () => {
    if (closing) return
    setClosing(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(onClose, reduced ? 0 : CLOSE_MS)
  }

  // (Braces, not a one-liner: an effect may only return a clean-up function, and newer
  // browsers return a promise from focus/scroll calls.)
  useEffect(() => {
    root.current?.focus()
  }, [])

  const initialCloseRequest = useRef(closeRequest)
  useEffect(() => {
    if (closeRequest !== initialCloseRequest.current) close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequest])

  // A new page starts at its top.
  useEffect(() => {
    page.current?.scrollTo(0, 0)
  }, [currentId])

  const index = items.indexOf(current)
  const go = (step) => setCurrentId(items[(index + step + items.length) % items.length].id)
  const choose = (id) => {
    setCurrentId(id)
    setMenuOpen(false)
  }

  return (
    <div className={`${styles.layer} ${closing ? styles.closing : ''}`} style={{ zIndex }} onPointerDown={onFocus}>
      <section
        ref={root}
        className={`${styles.showcase} ${active ? '' : styles.inactive}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return
          if (menuOpen) setMenuOpen(false)
          else close()
        }}
      >
        {/* An open book: the left page holds the title and the contents, the right page the
            chosen work. The cover, page edges and spine are drawn in CSS. */}
        <button type="button" className={styles.close} aria-label={`Close ${showcase.title}`} onClick={close}>
          ✕
        </button>
        <span className={styles.spine} aria-hidden="true" />
        <span className={styles.stitch} aria-hidden="true" />

        <div className={styles.leftPage}>
          <header className={styles.bar}>
            <h2 id={titleId} className={styles.title}>
              {showcase.title}
            </h2>
            {showcase.subtitle && <p className={styles.subtitle}>{showcase.subtitle}</p>}
          </header>

          <button type="button" className={styles.picker} aria-expanded={menuOpen} aria-controls={navId} onClick={() => setMenuOpen((open) => !open)}>
            <span className={styles.pickerCount}>
              {index + 1} / {items.length}
            </span>
            <span className={styles.pickerTitle}>{current.title}</span>
            <span className={styles.pickerCaret} aria-hidden="true">
              ▾
            </span>
          </button>

          <nav id={navId} className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label={`${showcase.title}: works and achievements`}>
            {showcase.groups.map((group) => (
              <div key={group.label} className={styles.group}>
                <p className={styles.groupLabel}>{group.label}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`${styles.navItem} ${item.id === current.id ? styles.navCurrent : ''}`}
                        aria-current={item.id === current.id ? 'page' : undefined}
                        onClick={() => choose(item.id)}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.rightPage} onPointerDown={() => setMenuOpen(false)}>
          <article ref={page} className={`${styles.page} ${current.Content ? styles.designed : ''}`} key={current.id} aria-live="polite">
            {/* A page with its own design (e.g. a case study deck) brings its own title. */}
            {current.Content ? (
              <>
                <h3 className={styles.designedTitle}>{current.title}</h3>
                <current.Content />
              </>
            ) : (
              <>
                {current.kicker && <p className={styles.kicker}>{current.kicker}</p>}
                <h3 className={styles.pageTitle}>{current.title}</h3>
              </>
            )}
            {current.summary && <p className={styles.summary}>{current.summary}</p>}

            {current.stats && (
              <dl className={styles.stats}>
                {current.stats.map((stat) => (
                  <div key={stat.label} className={styles.stat}>
                    <dt className={styles.statLabel}>{stat.label}</dt>
                    <dd className={styles.statValue}>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {current.media && <Media media={current.media} />}

            {current.points && (
              <ul className={styles.points}>
                {current.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}

            {items.length > 1 && (
              <footer className={styles.pager}>
                <button type="button" onClick={() => go(-1)}>
                  ← {items[(index - 1 + items.length) % items.length].title}
                </button>
                <button type="button" onClick={() => go(1)}>
                  {items[(index + 1) % items.length].title} →
                </button>
              </footer>
            )}
          </article>
        </div>
      </section>
    </div>
  )
}

function Media({ media }) {
  if (media.video) {
    return <video className={styles.media} src={media.video} poster={media.poster} autoPlay muted loop playsInline aria-hidden="true" />
  }
  return <img className={styles.media} src={media.src} alt={media.alt ?? ''} loading="lazy" />
}
