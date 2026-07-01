import { useRootStore } from '../../../store/rootStore'
import { useUIStore } from '../../../store/uiStore'
import { NumberField } from '../../../components/ui/NumberField'
import { faNumber } from '../../../lib/format/number'
import { scoreSectionResult, scoreVerdict, totalScore } from '../lib/scoreEngine'

export function SetupScoreCalculator() {
  const editMode = useUIStore((s) => s.editMode)
  const sections = useRootStore((s) => s.trading.scoreSections)
  const threshold = useRootStore((s) => s.trading.scoreThreshold)
  const setScoreThreshold = useRootStore((s) => s.setScoreThreshold)
  const addScoreSection = useRootStore((s) => s.addScoreSection)
  const updateScoreSectionTitle = useRootStore((s) => s.updateScoreSectionTitle)
  const removeScoreSection = useRootStore((s) => s.removeScoreSection)
  const addScoreOption = useRootStore((s) => s.addScoreOption)
  const updateScoreOption = useRootStore((s) => s.updateScoreOption)
  const toggleScoreOption = useRootStore((s) => s.toggleScoreOption)
  const removeScoreOption = useRootStore((s) => s.removeScoreOption)

  const total = totalScore(sections)
  const verdict = scoreVerdict(total, threshold)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>بخش ۱ — امتیاز کیفیت ست‌آپ</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 6, lineHeight: 1.6 }}>
          روی گزینه‌ها بزن تا فعال/غیرفعال شوند. <b style={{ color: 'var(--accent-red)' }}>در حالت ویرایش</b> می‌توانی نام، وزن، بخش
          را تغییر دهی و آستانهٔ ورود را عوض کنی.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>آستانهٔ ورود:</span>
          {editMode ? (
            <NumberField value={threshold} onChange={setScoreThreshold} style={{ width: 60, padding: '5px 9px', textAlign: 'center' }} />
          ) : (
            <b style={{ color: 'var(--text)' }}>{faNumber(threshold)}</b>
          )}
          <span>از ۱۰۰</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {sections.map((sec) => {
            const { sum, max } = scoreSectionResult(sec)
            return (
              <div key={sec.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  {editMode ? (
                    <>
                      <input
                        value={sec.title}
                        onChange={(e) => updateScoreSectionTitle(sec.id, e.target.value)}
                        style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 7, padding: '5px 9px', fontSize: 12, fontWeight: 600, background: 'var(--surface-muted)', outline: 'none' }}
                      />
                      <button type="button" onClick={() => removeScoreSection(sec.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 14 }}>
                        ×
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flex: 1 }}>{sec.title}</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-quiet)' }}>
                    {faNumber(sum, sum % 1 ? 2 : 0)} از {faNumber(max, max % 1 ? 2 : 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {sec.options.map((o) =>
                    editMode ? (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 9, padding: '4px 7px' }}>
                        <input
                          value={o.label}
                          onChange={(e) => updateScoreOption(sec.id, o.id, { label: e.target.value })}
                          style={{ width: 88, border: 'none', background: 'transparent', fontSize: 12, outline: 'none' }}
                        />
                        <NumberField value={o.weight} onChange={(v) => updateScoreOption(sec.id, o.id, { weight: v })} decimals={2} style={{ width: 36, padding: '3px 5px', textAlign: 'center' }} />
                        <button type="button" onClick={() => removeScoreOption(sec.id, o.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 13 }}>
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => toggleScoreOption(sec.id, o.id)}
                        style={{
                          border: `1px solid ${o.on ? 'var(--accent-red)' : 'var(--border)'}`,
                          background: o.on ? 'var(--accent-red-soft)' : 'var(--surface-muted)',
                          color: o.on ? 'var(--accent-red)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          borderRadius: 9,
                          padding: '8px 13px',
                          fontSize: 12,
                          fontWeight: o.on ? 700 : 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {o.label} · {faNumber(o.weight, o.weight % 1 ? 2 : 0)}
                      </button>
                    ),
                  )}
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => addScoreOption(sec.id)}
                      style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '7px 11px', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}
                    >
                      + گزینه
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {editMode && (
            <button
              type="button"
              onClick={addScoreSection}
              style={{ alignSelf: 'flex-start', border: 'none', background: 'var(--accent-red)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '8px 15px', fontSize: 12.5, fontWeight: 700 }}
            >
              + بخش جدید
            </button>
          )}
        </div>
      </div>

      <div style={{ background: verdict.bg, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center', alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600 }}>امتیاز کل از ۱۰۰</div>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-1px', color: verdict.color, lineHeight: 1.1, margin: '4px 0' }}>{faNumber(total, total % 1 ? 1 : 0)}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: verdict.color }}>{verdict.label}</div>
      </div>
    </div>
  )
}
