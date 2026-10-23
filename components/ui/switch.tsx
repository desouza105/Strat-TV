import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** Interrupteur 44 x 26 px, coins 8 px. */
function Switch({ checked, onCheckedChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[26px] w-11 shrink-0 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50",
        checked ? "bg-primary" : "bg-[#2a2b33]",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] size-5 rounded-md transition-all",
          checked ? "left-[21px] bg-background" : "left-[3px] bg-[#8b8b96]"
        )}
      />
    </button>
  )
}

export { Switch }
