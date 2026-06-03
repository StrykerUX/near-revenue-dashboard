"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface DropdownProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  className?: string
}

export function Dropdown({ value, onChange, options, className }: DropdownProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-near-card border border-near-border rounded-lg pl-3 pr-8 py-1.5 text-sm text-near-text cursor-pointer focus:outline-none focus:border-near-green/50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-near-muted pointer-events-none" />
    </div>
  )
}
