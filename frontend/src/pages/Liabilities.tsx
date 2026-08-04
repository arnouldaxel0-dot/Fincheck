import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Calendar, Percent } from 'lucide-react'
import { liabilitiesApi } from '../lib/api'
import { Liability, LIABILITY_LABELS, LiabilityCategory } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Card } from '../components/ui/Card'
import LiabilityForm from '../components/liabilities/LiabilityForm'

export default function Liabilities() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editItem, setEditItem] = useState<Liability | null>(null)

  const { data: liabilities = [], isLoading } = useQuery<Liability[]>({ queryKey: ['liabilities'], queryFn: () => liabilitiesApi.list().then((r) => r.data) })
  const inv = () => { qc.invalidateQueries({ queryKey: ['liabilities'] }); qc.invalidateQueries({ queryKey: ['dashboard-summary'] }) }

  const create = useMutation({ mutationFn: (d: object) => liabilitiesApi.create(d), onSuccess: () => { inv(); setShowCreate(false) } })
  const update = useMutation({ mutationFn: ({ id, d }: { id: number; d: object }) => liabilitiesApi.update(id, d), onSuccess: () => { inv(); setEditItem(null) } })
  const del = useMutation({ mutationFn: (id: number) => liabilitiesApi.delete(id), onSuccess: inv })

  const totalRem = liabilities.reduce((s,l)=>s+l.remaining_amount,0)
  const totalMo = liabilities.reduce((s,l)=>s+(l.monthly_payment||0),0)
  const prog = (l: Liability) => Math.round(((l.initial_amount-l.remaining_amount)/l.initial_amount)*100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">Crédits &amp; Passifs</h1>
          <p className="text-text-secondary text-sm mt-1">Capital restant : {formatCurrency(totalRem)} — Mensualités : {formatCurrency(totalMo)}/mois</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} />Ajouter un crédit</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><p className="text-text-secondary text-xs uppercase tracking-wider mb-2">Capital restant</p><p className="text-2xl font-bold text-danger">{formatCurrency(totalRem)}</p></Card>
        <Card><p className="text-text-secondary text-xs uppercase tracking-wider mb-2">Mensualités totales</p><p className="text-2xl font-bold text-warning">{formatCurrency(totalMo)}</p><p className="text-text-muted text-xs mt-1">par mois</p></Card>
        <Card><p className="text-text-secondary text-xs uppercase tracking-wider mb-2">Nombre de crédits</p><p className="text-2xl font-bold text-text-primary">{liabilities.length}</p></Card>
      </div>
      {isLoading ? <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple" /></div> : liabilities.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl px-8 py-16 text-center">
          <p className="text-text-muted text-sm">Aucun crédit enregistré</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus size={16} />Ajouter</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {liabilities.map((l) => {
            const p = prog(l)
            return (
              <div key={l.id} className="bg-bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-text-primary font-semibold">{l.name}</h3>
                      <span className="text-xs text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">{LIABILITY_LABELS[l.category as LiabilityCategory]}</span>
                    </div>
                    <p className="text-text-muted text-sm mb-3">{l.institution||'Organisme non renseigné'}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-text-muted mb-1.5"><span>Remboursé : {formatCurrency(l.initial_amount-l.remaining_amount)}</span><span>{p}%</span></div>
                      <div className="h-2 bg-bg-hover rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-accent-purple to-success rounded-full" style={{ width: `${p}%` }} /></div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div><span className="text-text-muted">Capital restant</span><span className="ml-2 text-danger font-semibold">{formatCurrency(l.remaining_amount)}</span></div>
                      {l.monthly_payment && <div><span className="text-text-muted">Mensualité</span><span className="ml-2 text-warning font-medium">{formatCurrency(l.monthly_payment)}/mois</span></div>}
                      {l.interest_rate && <div className="flex items-center gap-1"><Percent size={12} className="text-text-muted"/><span className="text-text-secondary">{l.interest_rate}%</span></div>}
                      {l.end_date && <div className="flex items-center gap-1"><Calendar size={12} className="text-text-muted"/><span className="text-text-secondary">Fin : {formatDate(l.end_date)}</span></div>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditItem(l)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover"><Pencil size={15}/></button>
                    <button onClick={() => { if(confirm(`Supprimer "${l.name}" ?`)) del.mutate(l.id) }} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10"><Trash2 size={15}/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Ajouter un crédit" size="lg"><LiabilityForm onSubmit={(d) => create.mutateAsync(d)} loading={create.isPending} /></Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Modifier le crédit" size="lg">{editItem && <LiabilityForm defaultValues={editItem} onSubmit={(d) => update.mutateAsync({ id: editItem.id, d })} loading={update.isPending} />}</Modal>
    </div>
  )
}
