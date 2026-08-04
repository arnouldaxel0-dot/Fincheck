import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={cn('bg-bg-card border border-border rounded-xl p-5', onClick && 'cursor-pointer hover:border-accent-purple/40 transition-colors', className)}>{children}</div>
}
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
}
export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wider">{children}</h3>
}
