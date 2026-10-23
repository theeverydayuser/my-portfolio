import styles from './deck.module.css'

/*
  The building blocks every case-study deck shares (the NaXum decks in Figma all use one
  slide kit): a slide with its footer, the chapter label, the outlined headline artwork, an
  image, and the header row. makeDeck binds them to one deck's assets folder, footer line and
  slide count, so each deck file only describes its slides.
*/
const DOT = '/assets/naxum-motion/dot.svg'

export function makeDeck({ base, line, total }) {
  function Slide({ page, light = false, className = '', children }) {
    return (
      <section className={`${styles.slide} ${light ? styles.light : styles.dark} ${className}`}>
        {children}
        <footer className={styles.footer} aria-hidden="true">
          <span>{line}</span>
          <span>
            {page} / {total}
          </span>
        </footer>
      </section>
    )
  }

  // A deck's headline artwork (outlined Helvena), at its design width; `n` is its slide.
  function Headline({ n, w, h, children }) {
    return (
      <h3 className={styles.headline}>
        <img src={`${base}h${String(n).padStart(2, '0')}.svg`} alt={children} width={w} height={h} style={{ '--w': w }} />
      </h3>
    )
  }

  function Img({ name, w, h, className = '', alt = '' }) {
    return <img className={`${styles.img} ${className}`} src={`${base}${name}.webp`} alt={alt} width={w} height={h} loading="lazy" />
  }

  return { Slide, Headline, Img, Eyebrow, Header }
}

// The chapter label: a glowing blue dot and mono caps.
export function Eyebrow({ children }) {
  return (
    <p className={styles.eyebrow}>
      <img src={DOT} alt="" className={styles.eyebrowDot} />
      {children}
    </p>
  )
}

// A slide's top row: eyebrow and headline on the left, the lead paragraph on the right.
export function Header({ eyebrow, headline, children }) {
  return (
    <div className={styles.header}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        {headline}
      </div>
      <p className={styles.bodyL}>{children}</p>
    </div>
  )
}
