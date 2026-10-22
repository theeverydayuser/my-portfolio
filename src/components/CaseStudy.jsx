import styles from './CaseStudy.module.css'

// `heading` overrides the page title when it differs from the window title.
export default function CaseStudy({ title, heading = title, meta, hero, sections }) {
  return (
    <article className={styles.caseStudy}>
      <h2 className={styles.title}>{heading}</h2>

      <dl className={styles.meta}>
        {meta.map((item, i) => (
          <div key={i} className={styles.metaCard}>
            <dt className={styles.metaLabel}>{item.label}</dt>
            <dd className={`${styles.metaValue} ${item.size ? styles[item.size] : ''}`}>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">{item.value}</a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <Media image={hero} className={styles.hero} eager />

      {sections.map((section, i) =>
        section.columns ? (
          <div key={i} className={styles.columns}>
            {section.columns.map((column, j) => (
              <Section key={j} section={column} />
            ))}
          </div>
        ) : (
          <Section key={i} section={section} />
        ),
      )}
    </article>
  )
}

function Section({ section }) {
  const paragraphs = Array.isArray(section.body) ? section.body : [section.body]
  return (
    <section className={styles.card}>
      {section.heading && <h3 className={styles.heading}>{section.heading}</h3>}
      {paragraphs.map((text, i) => (
        <p key={i} className={styles.body}>{text}</p>
      ))}
      {section.images && (
        <div className={styles.images}>
          {section.images.map((image, i) =>
            // A nested array is a row of images shown side by side.
            Array.isArray(image) ? (
              <div key={i} className={styles.imageRow}>
                {image.map((pair) => (
                  <Media key={pair.src} image={pair} className={styles.image} />
                ))}
              </div>
            ) : (
              <Media key={image.src} image={image} className={styles.image} />
            ),
          )}
        </div>
      )}
    </section>
  )
}

// Phones get the smaller mobile export; everything wider uses the desktop one.
function Media({ image, className, eager = false }) {
  return (
    <picture>
      {image.mobile && (
        <source
          media={MOBILE_QUERY}
          srcSet={image.mobile.src}
          width={image.mobile.width}
          height={image.mobile.height}
        />
      )}
      <img
        className={className}
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  )
}

const MOBILE_QUERY = '(max-width: 640px)'
