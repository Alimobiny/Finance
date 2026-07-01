const DIMENSIONS = [
  { label: 'درون‌گرایی (I)', opp: 'برون‌گرایی (E)', pct: 58.8 },
  { label: 'شهودی (N)', opp: 'حسی (S)', pct: 80 },
  { label: 'منطقی (T)', opp: 'احساسی (F)', pct: 75 },
  { label: 'قضاوتی (J)', opp: 'ادراکی (P)', pct: 76.5 },
]

const STRENGTHS = [
  'مستقل و کمال‌طلب با انگیزهٔ درونی قدرتمند',
  'قدرت تحلیل و حل منطقی و مبتکرانهٔ مسائل',
  'انتظار بالا از خود و دیگران، ایجاد انگیزه در اطراف',
  'باور عمیق به استقلال، صلاحیت و منطق‌ورزی شخصی',
]

const WEAKNESSES = [
  'معیارهای سخت‌گیرانه می‌تواند برای دیگران آزاردهنده باشد',
  'گاهی به معیارهای دیگران اهمیت کافی نمی‌دهد',
  'نقد صریح و تند، بدون توجه به تأثیرش بر دیگران',
]

const JOBS = ['پزشک/روان‌پزشک', 'محقق و دانشگاهی', 'مهندس طراح', 'تحلیل‌گر و اقتصاددان', 'نویسنده/ویراستار']

export function MbtiCard() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#5B4B8A,#3A2F66)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            flexShrink: 0,
          }}
        >
          INTJ-A
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>معمار (The Architect)</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 1 }}>
            درون‌گرا، شهودی، منطقی، قضاوتی — نقشه‌گرا، مفهوم‌پرداز، دانش‌طلب
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-purple)', background: '#F2EFF8', borderRadius: 8, padding: '7px 13px' }}>
          شعار: استقلال + شایستگی = کمال
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '11px 22px', marginBottom: 18 }}>
        {DIMENSIONS.map((d) => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 5 }}>
              <span style={{ fontWeight: 700 }}>{d.label}</span>
              <span style={{ color: 'var(--text-quiet)' }}>{d.opp}</span>
            </div>
            <div style={{ height: 8, borderRadius: 6, background: '#EFEBF5', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${d.pct}%`, background: 'linear-gradient(90deg,#5B4B8A,#7A68AD)', borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
        <div style={{ background: '#F1F8F3', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 9 }}>نقاط قوت</div>
          {STRENGTHS.map((x) => (
            <div key={x} style={{ fontSize: 12, color: '#33503F', lineHeight: 1.5, display: 'flex', gap: 7 }}>
              <span style={{ color: 'var(--accent-green)' }}>+</span>
              <span>{x}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#FBF1EE', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 9 }}>نقاط ضعف (مراقبشان باش)</div>
          {WEAKNESSES.map((x) => (
            <div key={x} style={{ fontSize: 12, color: '#6E3030', lineHeight: 1.5, display: 'flex', gap: 7 }}>
              <span style={{ color: 'var(--accent-red-strong)' }}>−</span>
              <span>{x}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px dashed var(--border)', display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>مشاغل هم‌راستا:</span>
        {JOBS.map((j) => (
          <span key={j} style={{ fontSize: 11.5, color: 'var(--accent-purple)', background: '#F2EFF8', borderRadius: 20, padding: '4px 11px' }}>
            {j}
          </span>
        ))}
      </div>
    </div>
  )
}
