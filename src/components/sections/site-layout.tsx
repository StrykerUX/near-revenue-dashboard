import { Header } from "@/components/sections/header"
import { Footer } from "@/components/sections/footer"

const NAV = process.env.NEXT_PUBLIC_DEBUG_SOURCES === "true"
  ? [
      { href: "/",          label: "Dashboard"  },
      { href: "/analytics", label: "Analytics"  },
      { href: "/data",      label: "Data Guide" },
    ]
  : undefined

interface SiteLayoutProps {
  children: React.ReactNode
  updatedAt?: string
}

export function SiteLayout({ children, updatedAt = "—" }: SiteLayoutProps) {
  return (
    <main className="min-h-screen bg-near-bg">
      <Header updatedAt={updatedAt} nav={NAV} />
      {children}
      <Footer />
    </main>
  )
}
