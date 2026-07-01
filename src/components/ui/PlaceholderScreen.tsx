type Props = {
  title: string
  subtitle: string
  note?: string
}

/** جای‌نگهدار موقت صفحات تا تکمیل در مرحله‌های بعدی ساخت */
export function PlaceholderScreen({ title, subtitle, note }: Props) {
  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: '3px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6 }}>{subtitle}</p>
      </div>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 20px',
          textAlign: 'center',
          color: 'var(--text-quiet)',
          fontSize: 13,
        }}
      >
        {note ?? 'این بخش در مرحلهٔ بعدی ساخت تکمیل می‌شود.'}
      </div>
    </section>
  )
}
