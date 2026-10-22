import { place } from './scene.js'
import styles from './Room.module.css'

/*
  LCD in the bookcase's top bay: all-time visits, or, whenever more than one person is in
  the room, how many are here now.
*/
export default function VisitCounter({ visits, here, L }) {
  const count = visits === null ? '-----' : String(visits).padStart(5, '0')
  return (
    <div className={styles.lcd} style={place(L.counter, L)} role="status" aria-live="polite" aria-label={here > 1 ? `${here} here now, ${visits} visits` : `${visits} visits`}>
      {here > 1 ? (
        <span className={styles.here}>
          <span className={styles.liveDot} aria-hidden="true" />
          {`${here} here · ${count}`}
        </span>
      ) : (
        <span>{`${count} visits`}</span>
      )}
    </div>
  )
}
