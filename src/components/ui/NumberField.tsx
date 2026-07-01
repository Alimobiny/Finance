import type { CSSProperties } from 'react'
import { faNumber, parseNumberInput } from '../../lib/format/number'

type Props = {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  decimals?: number
  style?: CSSProperties
}

/** ورودی عددی با نمایش رقم فارسی و جداکنندهٔ هزارگان (برای مبالغ تومانی، درصدها و ...) */
export function NumberField({ value, onChange, placeholder, decimals = 0, style }: Props) {
  return (
    <input
      inputMode="decimal"
      value={value ? faNumber(value, decimals) : ''}
      onChange={(e) => onChange(parseNumberInput(e.target.value))}
      placeholder={placeholder}
      style={{
        width: '100%',
        border: '1px solid var(--border)',
        borderRadius: 9,
        padding: '8px 10px',
        fontSize: 12.5,
        direction: 'ltr',
        textAlign: 'left',
        background: 'var(--surface-muted)',
        outline: 'none',
        ...style,
      }}
    />
  )
}
