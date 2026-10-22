import { COVERS, drawBookCover } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { place } from './scene.js'
import styles from './Shelf.module.css'

const COVER = { w: 26, h: 31 }
const coverUrl = (name) => spriteUrl(`book-${name}`, COVER.w, COVER.h, (r) => drawBookCover(r, COVER.w, COVER.h, COVERS[name] ?? COVERS.charcoal))

// Characters in the longest word: CSS shrinks the type so that word fits the book's width.
const longestWord = (text) => Math.max(...text.split(/\s+/).map((w) => w.length))

// One book on the shelf: a pixel cover drawn in code, with the work's title written on it.
// `onPreview(work | null)` tells the monitor which book is being looked at (hover or keyboard focus).
export function Book({ work, onOpen, onPreview, className = '', style }) {
  return (
    <button
      type="button"
      className={`${styles.book} ${className}`}
      style={{
        ...style,
        backgroundImage: `url(${coverUrl(work.cover)})`,
        '--title-chars': longestWord(work.title),
        '--sub-chars': longestWord(work.subtitle),
      }}
      onClick={(event) => onOpen(work.id, event.currentTarget)}
      onPointerEnter={onPreview && ((event) => event.pointerType === 'mouse' && onPreview(work))}
      onPointerLeave={onPreview && (() => onPreview(null))}
      onFocus={onPreview && (() => onPreview(work))}
      onBlur={onPreview && (() => onPreview(null))}
    >
      <span className={styles.title}>{work.title}</span>
      <span className={styles.subtitle}>{work.subtitle}</span>
    </button>
  )
}

// Works fill the bookcase's slots in order; however many slots this screen has.
export default function Shelf({ works, L, onOpen, onPreview }) {
  return (
    <ul className={styles.shelf} aria-label="My works">
      {works.slice(0, L.bookSlots.length).map((work, i) => (
        <li key={work.id}>
          <Book work={work} onOpen={onOpen} onPreview={onPreview} className={styles.onShelf} style={{ ...place(L.bookSlots[i], L), '--k': L.bookSlots[i].width / 26 }} />
        </li>
      ))}
    </ul>
  )
}
