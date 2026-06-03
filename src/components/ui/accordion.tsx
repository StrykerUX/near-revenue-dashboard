"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import type { FaqItem } from "@/lib/types"

interface AccordionProps {
  items: FaqItem[]
  defaultOpenId?: string
}

export function Accordion({ items, defaultOpenId }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)

  return (
    <div className="divide-y divide-near-border">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center gap-4 py-5 text-left group"
            >
              <span className="text-sm text-near-subtle font-mono shrink-0">{item.id}</span>
              <span className={cn("flex-1 text-base font-medium", isOpen ? "text-near-text" : "text-near-text/80 group-hover:text-near-text transition-colors")}>
                {item.question}
              </span>
              <span className={cn("shrink-0", isOpen ? "text-near-green" : "text-near-muted")}>
                {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="pb-5 pl-9 pr-4">
                <p className="text-sm text-near-muted leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
