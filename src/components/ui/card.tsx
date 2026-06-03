import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-2xl border border-near-border", {
  variants: {
    variant: {
      default: "bg-near-card",
      muted: "bg-near-card/60",
    },
    padding: {
      default: "p-6",
      sm: "p-4",
      lg: "p-8",
      none: "",
    },
  },
  defaultVariants: { variant: "default", padding: "default" },
})

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}
