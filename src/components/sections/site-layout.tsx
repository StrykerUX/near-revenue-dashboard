import { Header } from "@/components/sections/header"
import { Footer } from "@/components/sections/footer"

const NAV = [
  { href: "/",          label: "Dashboard"  },
  { href: "/analytics", label: "Analytics"  },
  { href: "/data",      label: "Data Guide" },
]

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
