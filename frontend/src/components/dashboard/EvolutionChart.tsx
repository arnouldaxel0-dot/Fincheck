import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { NetWorthPoint } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { Card, CardHeader, CardTitle } from '../ui/Card'

export default function EvolutionChart({ data }: { data: NetWorthPoint[] }) {
  if (data.length === 0) return (
    <Card><CardHeader><CardTitle>Évolution du patrimoine</CardTitle></CardHeader><div className="flex items-center justify-center py-16 text-text-muted text-sm">L'historique s'affichera ici après quelques semaines de suivi</div></Card>
  )
  const fmt = data.map((d) => ({ ...d, date: new Intl.DateTimeFormat('fr-FR', { month: 'short', day: 'numeric' }).format(new Date(d.date)) }))
  return (
    <Card>
      <CardHeader><CardTitle>Évolution du patrimoine</CardTitle></CardHeader>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={fmt} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C6FF7" stopOpacity={0.3}/><stop offset="95%" stopColor="#7C6FF7" stopOpacity={0}/></linearGradient>
            <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2A40" />
          <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k€`} />
          <Tooltip contentStyle={{ backgroundColor: '#161D2F', border: '1px solid #1E2A40', borderRadius: 8 }} labelStyle={{ color: '#F1F5F9', fontWeight: 600 }} formatter={(v: number, n: string) => [formatCurrency(v), { net_worth: 'Patrimoine net', total_assets: 'Actifs', total_liabilities: 'Crédits' }[n] || n]} />
          <Area type="monotone" dataKey="total_assets" stroke="#10B981" fill="url(#aGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="net_worth" stroke="#7C6FF7" fill="url(#nwGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
