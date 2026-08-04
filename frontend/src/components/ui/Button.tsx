import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'danger'|'ghost'; size?: 'sm'|'md'|'lg'; loading?: boolean; children: ReactNode
}

export function Button({ variant='primary', size='md', loading, children, className, disabled, ...props }: ButtonProps) {
  const variants = { primary: 'bg-accent-purple hover:bg-accent-purple/90 text-white', secondary: 'bg-bg-hover border border-border text-text-primary hover:border-accent-purple/50', danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20', ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-hover' }
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-3' }
  return (
    <button className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-purple/50 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], sizes[size], className)} disabled={disabled||loading} {...props}>
      {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
      {children}
    </button>
  )
}
