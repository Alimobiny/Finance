import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

/**
 * مرزِ خطا — یک خطای رندر در هر جای درخت، به‌جای سفیدشدنِ کلِ اپ، این صفحهٔ
 * بازیابی را نشان می‌دهد. دادهٔ کاربر در localStorage/Drive **دست‌نخورده**
 * می‌ماند؛ معمولاً یک ری‌لود مشکل را حل می‌کند. (کلاس‌کامپوننت چون تنها
 * componentDidCatch/getDerivedStateFromError خطای رندر را می‌گیرند.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    // لاگ برای دیباگ؛ هیچ داده‌ای پاک نمی‌شود.
    console.error('ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        dir="rtl"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-5)',
          background: 'var(--bg)',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 440,
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-7)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 34, marginBottom: 'var(--space-3)' }}>🧭</div>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-extrabold)', color: 'var(--text)' }}>
            مشکلی پیش آمد
          </h1>
          <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)' }}>
            بخشی از برنامه به مشکل خورد. اطلاعات شما ذخیره و امن است — معمولاً یک بارگذاری مجدد مشکل را حل می‌کند.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--space-5)',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              background: 'linear-gradient(135deg, var(--accent-navy), var(--accent-blue))',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2-5) var(--space-6)',
              fontSize: 'var(--fs-sm)',
              fontWeight: 'var(--fw-bold)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            بارگذاری مجدد
          </button>

          {this.state.message && (
            <div
              style={{
                marginTop: 'var(--space-5)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px dashed var(--border)',
                fontSize: 'var(--fs-2xs)',
                color: 'var(--text-quiet)',
                direction: 'ltr',
                wordBreak: 'break-word',
              }}
            >
              {this.state.message}
            </div>
          )}
        </div>
      </div>
    )
  }
}
