import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// O OnPath só tem o tema claro, então o tema fica fixo (sem next-themes).
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-branco)",
          "--normal-text": "var(--color-preto)",
          "--normal-border": "var(--color-cinza-200)",
          "--border-radius": "var(--radius-lg)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
