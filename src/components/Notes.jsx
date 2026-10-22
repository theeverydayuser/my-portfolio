import { useState } from 'react'
import styles from './Notes.module.css'

// Content and layout follow the Notes popup design (Experience and About notes).
const experience = [
  {
    role: 'VP of Design & Front-End',
    company: 'NaXum',
    year: '2026',
    points: [
      'Design and build the front end of a SaaS platform for direct-sales companies, from Figma to production.',
      'Lead QA on the team’s merge requests with file-and-line evidence and clear approve or change verdicts.',
      'Ran the end-to-end testing gate for a new AI product, credits and billing included, before launch.',
    ],
  },
]

const about = [
  'I’m Mide, a design engineer who builds with AI.',
  'I design in Figma and ship in code: Vue 3, Tailwind and Laravel on the product side, Next.js for marketing sites.',
  'More notes are on the way as I add my work here.',
]

const notes = [
  { id: 'experience', title: 'Experience', preview: 'My professional journey.' },
  { id: 'about', title: 'About', preview: 'I’m Mide, a design engin....', mobilePreview: 'I’m Mide, a design engineer who builds with AI.' },
]

export default function Notes() {
  const [current, setCurrent] = useState('experience')

  return (
    <div className={styles.notes}>
      <nav className={styles.sidebar} aria-label="Notes">
        {notes.map((note) => (
          <button
            key={note.id}
            type="button"
            className={`${styles.item} ${current === note.id ? styles.selected : ''}`}
            aria-current={current === note.id ? 'true' : undefined}
            onClick={() => setCurrent(note.id)}
          >
            <span className={styles.itemTitle}>{note.title}</span>
            <span className={`${styles.itemPreview} ${note.mobilePreview ? styles.desktopOnly : ''}`}>{note.preview}</span>
            {note.mobilePreview && (
              <span className={`${styles.itemPreview} ${styles.mobileOnly}`}>{note.mobilePreview}</span>
            )}
          </button>
        ))}
      </nav>

      <article className={styles.note}>
        {current === 'experience' ? (
          <>
            <h2 className={styles.title}>Experience</h2>
            {experience.map((job) => (
              <section key={job.company} className={styles.job}>
                <h3 className={styles.jobTitle}>
                  {job.role} — {job.company} · [{job.year}]
                </h3>
                <ul className={styles.points}>
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        ) : (
          <>
            <h2 className={styles.title}>About</h2>
            {about.map((text) => (
              <p key={text} className={styles.paragraph}>{text}</p>
            ))}
          </>
        )}
      </article>
    </div>
  )
}
