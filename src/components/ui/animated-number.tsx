"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

function parseValue(raw: string): { num: number; suffix: string; decimals: number } {
  const s = raw.trim()
  if (s.endsWith("%")) return { num: parseFloat(s), suffix: "%", decimals: 1 }
  if (s.endsWith("M")) return { num: parseFloat(s), suffix: "M", decimals: 2 }
  if (s.endsWith("K")) return { num: parseFloat(s), suffix: "K", decimals: 1 }
  return { num: parseFloat(s), suffix: "", decimals: 1 }
}

interface AnimatedNumberProps {
  value: string
  className?: string
  style?: React.CSSProperties
  duration?: number
  delay?: number
}

export function AnimatedNumber({
  value,
  className,
  style,
  duration = 1.8,
  delay = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { num, suffix, decimals } = parseValue(value)
    const obj = { v: 0 }

    const runAnimation = () => {
      gsap.to(obj, {
        v: num,
        duration,
        delay,
        ease: "power2.out",
        onUpdate() {
          el.textContent = obj.v.toFixed(decimals) + suffix
        },
        onComplete() {
          el.textContent = value
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
    observer.observe(el)

    return () => observer.disconnect()
  }, [value, duration, delay])

  return (
    <span ref={ref} className={cn(className)} style={style}>
      0
    </span>
  )
}
