import styles from './AboutMe.module.css'

const LINKEDIN = 'https://www.linkedin.com/in/ademidesamuel/'

const details = [
  { label: 'Name', value: 'Mide Adeshina' },
  { label: 'Role', value: 'VP of Design & Front-End · Design Engineer' },
  { label: 'LinkedIn', value: 'in/ademidesamuel', href: LINKEDIN },
]

const expertise = [
  'Product Design',
  'Design Systems',
  'Front-End Engineering',
  'Vue 3',
  'Next.js',
  'Figma',
  'Claude Code',
  'QA & Code Review',
  'Motion',
]

// Content and layout follow the About Me popup design.
export default function AboutMe() {
  return (
    <article className={styles.about}>
      <h2 className={styles.title}>About Me</h2>

      <div className={styles.profile}>
        <img
          className={styles.portrait}
          src="/assets/about/portrait.webp"
          width="880"
          height="992"
          alt="Portrait of Mide Adeshina"
        />
        {/* Contact details stay selectable and copyable for recruiters. */}
        <dl className={styles.details} data-copyable>
          {details.map((item) => (
            <div key={item.label} className={styles.row}>
              <dt className={styles.label}>{item.label}</dt>
              <dd className={styles.value}>
                {item.href ? <a href={item.href} target="_blank" rel="noopener noreferrer">{item.value}</a> : item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className={styles.card}>
        <p className={styles.body}>
          I’m a design engineer who takes products from Figma to production. As VP of Design &amp; Front-End at NaXum,
          I design and build the front end of a SaaS platform for direct-sales companies, and the marketing sites around it.
        </p>
        <p className={styles.body}>
          I work AI-native: a voice note becomes a user story, then a working prototype with Claude Code. I lead deep QA on
          the team’s merge requests, because “done” means verified end to end.
        </p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.heading}>Expertise</h3>
        <p className={styles.body}>{expertise.join(' · ')}</p>
      </section>

      <a className={styles.contact} href={LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="Contact me on LinkedIn (opens in a new tab)">
        Contact me
      </a>
    </article>
  )
}
