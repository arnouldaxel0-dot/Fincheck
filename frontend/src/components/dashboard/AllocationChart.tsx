import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardSummary, ASSET_COLORS, AssetCategory } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { Card, CardHeader, CardTitle } from '../ui/Card'

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  return <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{`${(percent*100).toFixed(0)}%`}</text>
}

export default function AllocationChart({ data }: { data: DashboardSummary }) {
  const chartData = data.assets_by_category.filter((c) => c.total > 0).map((c) => ({ name: c.label, value: c.total, color: ASSET_COLORS[c.category as AssetCategory] || '#94A3B8' }))
  if (chartData.length === 0) return (
    <Card><CardHeader><CardTitle>Répartition des actifs</CardTitle></CardHeader><div className="flex items-center justify-center py-12 text-text-muted text-sm">Aucun actif enregistré</div></Card>
  )
  return (
    <Card>
      <CardHeader><CardTitle>Répartition des actifs</CardTitle></CardHeader>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" labelLine={false} label={renderLabel}>
            {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#161D2F', border: '1px solid #1E2A40', borderRadius: 8 }} formatter={(v: number) => [formatCurrency(v), '']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-text-secondary">{item.name}</span></div>
            <span className="text-text-primary font-medium">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
