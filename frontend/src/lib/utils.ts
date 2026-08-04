import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}

export function calcPnl(value: number, price?: number, qty?: number): number | null {
  if (!price || !qty) return null
  return value - price * qty
}

export function calcPnlPct(value: number, price?: number, qty?: number): number | null {
  if (!price || !qty) return null
  const cost = price * qty
  return ((value - cost) / cost) * 100
}
