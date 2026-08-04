import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Camera } from 'lucide-react'
import { dashboardApi } from '../lib/api'
import { DashboardSummary, NetWorthPoint } from '../types'
import SummaryCards from '../components/dashboard/SummaryCards'
import AllocationChart from '../components/dashboard/AllocationChart'
import EvolutionChart from '../components/dashboard/EvolutionChart'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../lib/utils'

export default function Dashboard() {
  const qc = useQueryClient()
  const { data: summary, isLoading } = useQuery<DashboardSummary>({ queryKey: ['dashboard-summary'], queryFn: () => dashboardApi.summary().then((r) => r.data) })
  const { data: history = [] } = useQuery<NetWorthPoint[]>({ queryKey: ['networth-history'], queryFn: () => dashboardApi.networthHistory(180).then((r) => r.data) })
  const snap = useMutation({ mutationFn: () => dashboardApi.snapshot(), onSuccess: () => qc.invalidateQueries({ queryKey: ['networth-history'] }) })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">Tableau de bord</h1>
          <p className="text-text-secondary text-sm mt-1">Vue d'ensemble de votre patrimoine</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { qc.invalidateQueries({ queryKey: ['dashboard-summary'] }); qc.invalidateQueries({ queryKey: ['networth-history'] }) }}><RefreshCw size={14} />Actualiser</Button>
          <Button variant="secondary" size="sm" onClick={() => snap.mutate()} loading={snap.isPending}><Camera size={14} />Snapshot</Button>
        </div>
      </div>
      {summary && <SummaryCards data={summary} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary && <AllocationChart data={summary} />}
        <EvolutionChart data={history} />
      </div>
      {summary && (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border"><h3 className="text-text-secondary text-xs font-medium uppercase tracking-wider">Détail par catégorie</h3></div>
          <div className="divide-y divide-border">
            {summary.assets_by_category.filter((c) => c.count > 0).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{cat.label}</span>
                  <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{cat.count} actif{cat.count>1?'s':''}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary text-sm">{cat.percentage}%</span>
                  <span className="text-text-primary font-semibold text-sm">{formatCurrency(cat.total)}</span>
                </div>
              </div>
            ))}
            {summary.assets_by_category.every((c) => c.count === 0) && <div className="px-5 py-8 text-center text-text-muted text-sm">Commencez par ajouter vos actifs dans l'onglet "Actifs"</div>}
          </div>
        </div>
      )}
    </div>
  )
}
