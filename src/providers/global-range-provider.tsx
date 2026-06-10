"use client"

import { createContext, useContext, useState } from "react"

export type GlobalRange = "7D" | "30D" | "90D" | "YTD" | "ALL"

interface GlobalRangeCtx {
  range: GlobalRange
  setRange: (r: GlobalRange) => void
}

const GlobalRangeContext = createContext<GlobalRangeCtx>({
  range: "90D",
  setRange: () => {},
})

export function GlobalRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<GlobalRange>("90D")
  return (
    <GlobalRangeContext.Provider value={{ range, setRange }}>
      {children}
    </GlobalRangeContext.Provider>
  )
}

export function useGlobalRange(): GlobalRangeCtx {
  return useContext(GlobalRangeContext)
}
