import { testimonials } from '../data/testimonials.js'
import styles from './Testimonials.module.css'

const LINKEDIN = 'https://www.linkedin.com/in/ademidesamuel/'

// The "Kind words" window: every recommendation in full, as notes on a board.
export default function Testimonials() {
  return (
    <div className={styles.board}>
      <header className={styles.intro}>
        <h2>Kind words</h2>
        <p>
          Recommendations from people I’ve worked with, word for word from{' '}
          <a href={`${LINKEDIN}details/recommendations/`} target="_blank" rel="noopener noreferrer">
            my LinkedIn
          </a>
          .
        </p>
      </header>
      <ul className={styles.notes}>
        {testimonials.map((t, i) => (
          <li key={t.id} className={styles.note} style={{ '--tilt': `${i % 2 ? 0.6 : -0.6}deg` }}>
            <blockquote className={styles.quote}>
              {t.quote.split('\n').filter(Boolean).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </blockquote>
            <p className={styles.who}>
              <strong>{t.name}</strong>
              <span>{t.role}</span>
              <span className={styles.relation}>{t.relation}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
