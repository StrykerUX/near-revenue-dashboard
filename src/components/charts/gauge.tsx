"use client"

// Circular gauge SVG — no external library
// 270° sweep, gap at the bottom. r=80, cx=cy=100

import { useEffect, useRef } from "react"
import gsap from "gsap"

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

  const arcRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const containerRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const arc = arcRef.current
    const text = textRef.current
    const container = containerRef.current
    if (!arc || !text || !container) return

    // Start with empty arc
    arc.setAttribute("stroke-dasharray", `0 ${circumference}`)
    text.textContent = "0.0%"

    const arcObj = { v: 0 }
    const textObj = { v: 0 }

    const runAnimation = () => {
      gsap.to(arcObj, {
        v: filled,
        duration: 1.5,
        ease: "power2.out",
        onUpdate() {
          arc.setAttribute("stroke-dasharray", `${arcObj.v} ${circumference}`)
        },
      })
      gsap.to(textObj, {
        v: value,
        duration: 1.5,
        ease: "power2.out",
        onUpdate() {
          text.textContent = textObj.v.toFixed(1) + "%"
        },
        onComplete() {
          text.textContent = value + "%"
        },
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          runAnimation()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(container)

    return () => observer.disconnect()
  }, [value, filled, circumference])

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 200 200"
      className="w-48 h-48 mx-auto"
      aria-label={`${value}% capture rate`}
    >
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
      {/* Filled arc — animated via ref */}
      <circle
        ref={arcRef}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--near-green)"
        strokeWidth={12}
        strokeDasharray={`0 ${circumference}`}
        strokeLinecap="round"
        transform="rotate(135 100 100)"
      />
      {/* Center label — animated via ref */}
      <text
        ref={textRef}
        x="100"
        y="93"
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontWeight="600"
        fontFamily="var(--font-geist-sans)"
      >
        0.0%
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
        CAPTURE
      </text>
    </svg>
  )
}
