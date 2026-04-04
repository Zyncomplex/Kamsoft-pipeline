import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message?: string
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="h-3 w-3" />
      <span>{message}</span>
    </div>
  )
}
