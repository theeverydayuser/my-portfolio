import { OPENS } from '../../data/room.js'
import { openerLabel } from './opens.js'
import styles from './Room.module.css'

// A fixed thing in the room that opens something, with a pixel tooltip naming it.
// `tip={false}` drops the hover tooltip, for things that already label themselves.
export default function Opener({ opens, className = '', style, children, onOpen, tip: showTip = true }) {
  const target = OPENS[opens]
  const tip = showTip && <span className={styles.tip}>{openerLabel(opens)}</span>

  if (target.window) {
    return (
      <button type="button" className={`${styles.opener} ${className}`} style={style} aria-label={target.label} onClick={(event) => onOpen(target.window, event.currentTarget)}>
        {children}
        {tip}
      </button>
    )
  }
  if (target.href) {
    return (
      <a className={`${styles.opener} ${className}`} style={style} href={target.href} target="_blank" rel="noopener noreferrer" aria-label={`${target.label} (opens in a new tab)`}>
        {children}
        {tip}
      </a>
    )
  }
  return (
    <span className={`${styles.opener} ${styles.soon} ${className}`} style={style} role="link" aria-disabled="true" aria-label={`${target.label} (coming soon)`}>
      {children}
      {tip}
    </span>
  )
}
