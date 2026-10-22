// Temporary content for windows whose design hasn't been provided yet.
export default function Placeholder({ title }) {
  return (
    <div style={{ padding: 'var(--cs-gutter)', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'calc(40 * var(--u))', fontWeight: 500, lineHeight: 1.1 }}>
        {title}
      </h2>
      <p style={{ marginTop: 'calc(24 * var(--u))', fontSize: 'max(14px, calc(18 * var(--u)))', color: 'var(--cs-body)' }}>
        The case study is on its way.
      </p>
    </div>
  )
}
