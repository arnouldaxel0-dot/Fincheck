import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { assetsApi } from '../lib/api'
import { Asset, ASSET_LABELS, ASSET_COLORS, AssetCategory } from '../types'
import { formatCurrency, calcPnl, calcPnlPct, cn } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import AssetForm from '../components/assets/AssetForm'

export default function Assets() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [filterCat, setFilterCat] = useState('all')

  const { data: assets = [], isLoading } = useQuery<Asset[]>({ queryKey: ['assets'], queryFn: () => assetsApi.list().then((r) => r.data) })
  const inv = () => { qc.invalidateQueries({ queryKey: ['assets'] }); qc.invalidateQueries({ queryKey: ['dashboard-summary'] }) }

  const create = useMutation({ mutationFn: (d: object) => assetsApi.create(d), onSuccess: () => { inv(); setShowCreate(false) } })
  const update = useMutation({ mutationFn: ({ id, d }: { id: number; d: object }) => assetsApi.update(id, d), onSuccess: () => { inv(); setEditAsset(null) } })
  const del = useMutation({ mutationFn: (id: number) => assetsApi.delete(id), onSuccess: inv })

  const filtered = filterCat === 'all' ? assets : assets.filter((a) => a.category === filterCat)
  const total = filtered.reduce((s, a) => s + a.value, 0)
  const cats = ['all', ...Object.keys(ASSET_LABELS)]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text-primary text-2xl font-bold">Actifs</h1>
          <p className="text-text-secondary text-sm mt-1">{assets.length} actif{assets.length>1?'s':''} — Total : {formatCurrency(assets.reduce((s,a)=>s+a.value,0))}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={16} />Ajouter un actif</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => <button key={c} onClick={() => setFilterCat(c)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border', filterCat===c ? 'bg-accent-purple text-white border-accent-purple' : 'border-border text-text-secondary hover:border-accent-purple/40')}>{c==='all'?'Tous':ASSET_LABELS[c as AssetCategory]}</button>)}
      </div>
      {isLoading ? <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple" /></div> : filtered.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl px-8 py-16 text-center">
          <p className="text-text-muted text-sm">Aucun actif pour cette catégorie</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus size={16} />Ajouter</Button>
        </div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-text-muted text-xs font-medium uppercase">Actif</th>
              <th className="text-left px-4 py-3 text-text-muted text-xs font-medium uppercase hidden sm:table-cell">Institution</th>
              <th className="text-right px-4 py-3 text-text-muted text-xs font-medium uppercase hidden md:table-cell">P&amp;L</th>
              <th className="text-right px-5 py-3 text-text-muted text-xs font-medium uppercase">Valeur</th>
              <th className="px-4 py-3 w-20"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map((asset) => {
                const pnl = calcPnl(asset.value, asset.purchase_price, asset.quantity)
                const pnlPct = calcPnlPct(asset.value, asset.purchase_price, asset.quantity)
                const color = ASSET_COLORS[asset.category]
                return (
                  <tr key={asset.id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }} /><div><p className="text-text-primary text-sm font-medium">{asset.name}</p><p className="text-text-muted text-xs">{ASSET_LABELS[asset.category]}</p></div></div></td>
                    <td className="px-4 py-4 hidden sm:table-cell"><span className="text-text-secondary text-sm">{asset.institution||'—'}</span></td>
                    <td className="px-4 py-4 text-right hidden md:table-cell">{pnl!==null ? <div className={pnl>=0?'text-success':'text-danger'}><div className="flex items-center justify-end gap-1 text-sm font-medium">{pnl>=0?<TrendingUp size={14}/>:<TrendingDown size={14}/>}{formatCurrency(pnl)}</div>{pnlPct!==null&&<p className="text-xs opacity-75">{pnlPct>=0?'+':''}{pnlPct.toFixed(2)}%</p>}</div> : <span className="text-text-muted text-sm">—</span>}</td>
                    <td className="px-5 py-4 text-right"><span className="text-text-primary font-semibold">{formatCurrency(asset.value, asset.currency)}</span></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditAsset(asset)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover"><Pencil size={14}/></button>
                      <button onClick={() => { if(confirm(`Supprimer "${asset.name}" ?`)) del.mutate(asset.id) }} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10"><Trash2 size={14}/></button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot><tr className="border-t border-border bg-bg-hover"><td colSpan={3} className="px-5 py-3 text-text-secondary text-sm font-medium">Total ({filtered.length})</td><td className="px-5 py-3 text-right text-text-primary font-bold">{formatCurrency(total)}</td><td/></tr></tfoot>
          </table>
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Ajouter un actif"><AssetForm onSubmit={(d) => create.mutateAsync(d)} loading={create.isPending} /></Modal>
      <Modal open={!!editAsset} onClose={() => setEditAsset(null)} title="Modifier l'actif">{editAsset && <AssetForm defaultValues={editAsset} onSubmit={(d) => update.mutateAsync({ id: editAsset.id, d })} loading={update.isPending} />}</Modal>
    </div>
  )
}
