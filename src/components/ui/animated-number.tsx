"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

function parseValue(raw: string): { num: number; prefix: string; suffix: string; decimals: number } {
  const s = raw.trim()
  const prefix = s.startsWith("$") ? "$" : ""
  const body = s.replace(/^\$/, "").replace(/,/g, "")
  if (body.endsWith("%")) return { num: parseFloat(body), prefix, suffix: "%", decimals: 1 }
  if (body.endsWith("B")) return { num: parseFloat(body), prefix, suffix: "B", decimals: 2 }
  if (body.endsWith("M")) return { num: parseFloat(body), prefix, suffix: "M", decimals: 2 }
  if (body.endsWith("K")) return { num: parseFloat(body), prefix, suffix: "K", decimals: 1 }
  const num = parseFloat(body)
  return { num: isNaN(num) ? 0 : num, prefix, suffix: "", decimals: 0 }
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

    const { num, prefix, suffix, decimals } = parseValue(value)
    const obj = { v: 0 }

    const runAnimation = () => {
      gsap.to(obj, {
        v: num,
        duration,
        delay,
        ease: "power2.out",
        onUpdate() {
          el.textContent = prefix + obj.v.toFixed(decimals) + suffix
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
