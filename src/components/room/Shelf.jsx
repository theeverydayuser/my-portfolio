import { COVERS, drawBookCover, drawBookSpine } from '../../room-art/sprites.js'
import { spriteUrl } from '../../room-art/to-image.js'
import { place } from './scene.js'
import styles from './Shelf.module.css'

const COVER = { w: 26, h: 31 }
const coverUrl = (name) => spriteUrl(`book-${name}`, COVER.w, COVER.h, (r) => drawBookCover(r, COVER.w, COVER.h, COVERS[name] ?? COVERS.charcoal))
const spineUrl = (name, w, h) => spriteUrl(`spine-${name}-${w}x${h}`, w, h, (r) => drawBookSpine(r, w, h, COVERS[name] ?? COVERS.charcoal))

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

// One book standing spine-on in the phone's library, its title written up the spine.
function Spine({ work, slot, onOpen, L }) {
  return (
    <button
      type="button"
      className={`${styles.spine} ${styles.onShelf}`}
      style={{
        ...place(slot, L),
        backgroundImage: `url(${spineUrl(work.cover, slot.width, slot.height)})`,
        '--spine-w': slot.width,
        '--spine-h': slot.height,
        '--title-chars': work.title.length,
      }}
      aria-label={`${work.title}: ${work.subtitle}`}
      onClick={(event) => onOpen(work.id, event.currentTarget)}
    >
      <span className={styles.spineTitle}>{work.title}</span>
    </button>
  )
}

// Works fill the slots in order (however many this screen has): spines in the phone's
// library, covers facing out in the bookcase everywhere else.
export default function Shelf({ works, L, onOpen, onPreview }) {
  return (
    <ul className={styles.shelf} aria-label="My works">
      {works.slice(0, L.bookSlots.length).map((work, i) => (
        <li key={work.id}>
          {L.library ? (
            <Spine work={work} slot={L.bookSlots[i]} onOpen={onOpen} L={L} />
          ) : (
            <Book work={work} onOpen={onOpen} onPreview={onPreview} className={styles.onShelf} style={{ ...place(L.bookSlots[i], L), '--k': L.bookSlots[i].width / 26 }} />
          )}
        </li>
      ))}
    </ul>
  )
}
