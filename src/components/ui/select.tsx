import * as React from "react"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onValueChange?: (value: string) => void
}

type SelectContextType = {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  containerRef: React.RefObject<HTMLDivElement>
}

const SelectContext = React.createContext<SelectContextType | null>(null)

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, containerRef }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    return (
      <button
        ref={ref}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
        onClick={(e) => {
          ctx?.setOpen(!ctx.open)
          onClick?.(e)
        }}
        aria-haspopup="listbox"
        aria-expanded={ctx?.open || false}
        {...props}
      >
        {children}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, children }: SelectValueProps) => {
  const ctx = React.useContext(SelectContext)
  const content = children || (ctx?.value ? <span>{ctx.value}</span> : <span className="text-gray-500">{placeholder}</span>)
  return <span className="text-sm text-gray-900">{content}</span>
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null
  return (
    <div
      className={`absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-max min-w-full max-w-[90vw] ${className || ""}`}
      style={{ scrollbarGutter: "stable" as any }}
    >
      {children}
    </div>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, onValueChange, ...props }, ref) => {
    const ctx = React.useContext(SelectContext)
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={ctx?.value === value}
        className={`px-3 py-2 pr-12 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 whitespace-nowrap ${
          ctx?.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-blue-50'
        }`}
        onClick={() => {
          ctx?.onValueChange?.(value)
          onValueChange?.(value)
          ctx?.setOpen(false)
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } 