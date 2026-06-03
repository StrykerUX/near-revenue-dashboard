// Circular gauge SVG — no external library
// 270° sweep, gap at the bottom. r=80, cx=cy=100

interface GaugeProps {
  value: number
  max?: number
}

export function Gauge({ value, max = 100 }: GaugeProps) {
  const r = 80
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * r
  const arcLength = circumference * (270 / 360) // 376.99
  const filled = arcLength * (value / max)

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" aria-label={`${value}% capture rate`}>
      {/* Background track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--near-border)"
        strokeWidth={12}
        strokeDasharray={`${arcLength} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(135 100 100)"
      />
      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--near-green)"
        strokeWidth={12}
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(135 100 100)"
      />
      {/* Center label */}
      <text
        x="100"
        y="93"
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontWeight="600"
        fontFamily="var(--font-geist-sans)"
      >
        {value}%
      </text>
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fill="var(--near-muted)"
        fontSize="9"
        letterSpacing="1.5"
        fontFamily="var(--font-geist-sans)"
      >
        CAPTURE RATE
      </text>
    </svg>
  )
}
