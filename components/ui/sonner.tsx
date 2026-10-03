"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
  CircleCheck,
  Info,
  TriangleAlert,
  OctagonX,
  Loader2,
} from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-5 text-primary" />,
        info: <Info className="size-5 text-brand-sky" />,
        warning: <TriangleAlert className="size-5 text-brand-tangerine" />,
        error: <OctagonX className="size-5 text-destructive" />,
        loading: <Loader2 className="size-5 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--brand-cream)",
          "--normal-text": "var(--brand-ink)",
          "--normal-border": "color-mix(in oklab, var(--brand-ink) 10%, transparent)",
          "--border-radius": "1.1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group flex items-center gap-3 rounded-[1.1rem] border border-black/5 bg-brand-cream px-4 py-3 text-brand-ink shadow-xl",
          title: "font-heading font-bold text-[0.95rem] text-brand-ink",
          description: "text-muted-foreground",
          actionButton:
            "rounded-full bg-primary px-3 text-primary-foreground font-semibold",
          cancelButton: "rounded-full bg-muted px-3 font-semibold",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
