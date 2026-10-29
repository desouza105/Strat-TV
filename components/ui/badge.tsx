import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Étiquette non cliquable (DIRECT, HD, statuts). Distincte d'un bouton : 24 px, coins 6 px. */
const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-badge px-2 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-white/10 text-foreground",
        live: "bg-mint/15 text-mint",
        solid: "bg-mint text-primary-foreground",
        inverse: "bg-primary text-primary-foreground",
        overlay: "bg-background/70 text-foreground backdrop-blur",
        danger: "bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
