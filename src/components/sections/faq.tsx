import { Accordion } from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/data"

export function Faq() {
  return (
    <section className="pt-4">
      <h2 className="text-2xl font-semibold text-near-text mb-6">Frequently asked questions</h2>
      <Accordion items={FAQ_ITEMS} defaultOpenId="01" />
    </section>
  )
}
