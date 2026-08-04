import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react'
import { DashboardSummary } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { Card } from '../ui/Card'

export default function SummaryCards({ data }: { data: DashboardSummary }) {
  const cards = [
    { label: 'Patrimoine net', value: data.net_worth, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', highlight: true },
    { label: 'Total actifs', value: data.total_assets, icon: Wallet, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Total crédits', value: data.total_liabilities, icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Mensualités', value: data.monthly_payments, icon: CreditCard, color: 'text-warning', bg: 'bg-warning/10' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, highlight }) => (
        <Card key={label} className={highlight ? 'border-success/20' : ''}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
              <p className={`text-2xl font-bold ${highlight ? 'text-success' : 'text-text-primary'}`}>{formatCurrency(value)}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}><Icon size={20} className={color} /></div>
          </div>
        </Card>
      ))}
    </div>
  )
}
