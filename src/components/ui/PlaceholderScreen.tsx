type Props = {
  title: string
  subtitle: string
  note?: string
}

/** جای‌نگهدار موقت صفحات تا تکمیل در مرحله‌های بعدی ساخت */
export function PlaceholderScreen({ title, subtitle, note }: Props) {
  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 'var(--space-4-5)' }}>
        <h1 style={{ margin: '3px 0 0', fontSize: 'var(--fs-3xl)', fontWeight: 'var(--fw-extrabold)', letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ margin: 'var(--space-1-5) 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)' }}>{subtitle}</p>
      </div>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-7) var(--space-5)',
          textAlign: 'center',
          color: 'var(--text-quiet)',
          fontSize: 'var(--fs-sm)',
        }}
      >
        {note ?? 'این بخش در مرحلهٔ بعدی ساخت تکمیل می‌شود.'}
      </div>
    </section>
  )
}
