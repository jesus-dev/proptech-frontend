import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex flex-col space-y-2 w-full">
              {title && (
                <div className="flex items-start justify-between">
                  <ToastTitle>{title}</ToastTitle>
                  <ToastClose />
                </div>
              )}
              {description && (
                <ToastDescription className="mt-2">
                  {description}
                </ToastDescription>
              )}
              {action && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {action}
                </div>
              )}
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 