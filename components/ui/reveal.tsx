"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger the entrance of direct children instead of the wrapper itself. */
  stagger?: boolean
  /** Extra delay (ms) before this element animates in. Ignored when staggering. */
  delayMs?: number
}

/**
 * Fades + lifts content into view as it enters the viewport. Dependency-free
 * (IntersectionObserver) and fully reduced-motion safe — when the user prefers
 * reduced motion, or before JS hydrates, content renders visible by default via
 * the CSS guard in globals.css, so nothing is ever hidden without animation.
 *
 * Pass `stagger` and your grid/flex classes via `className` to use this as the
 * container itself — direct children animate in sequence.
 */
export function Reveal({
  stagger = false,
  delayMs = 0,
  className,
  children,
  style,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(stagger ? "reveal-stagger" : "reveal", visible && "is-visible", className)}
      style={
        delayMs && !stagger
          ? { ...style, transitionDelay: visible ? `${delayMs}ms` : undefined }
          : style
      }
      {...props}
    >
      {children}
    </div>
  )
}
