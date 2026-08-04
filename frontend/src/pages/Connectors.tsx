import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plug, RefreshCw, Trash2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { connectorsApi } from '../lib/api'
import { Connector } from '../types'
import { formatDate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

type Step = 'idle'|'phone'|'otp'|'done'

export default function Connectors() {
  const qc = useQueryClient()
  const [step, setStep] = useState<Step>('idle')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: connectors = [] } = useQuery<Connector[]>({ queryKey: ['connectors'], queryFn: () => connectorsApi.list().then((r) => r.data) })
  const trConn = connectors.find((c) => c.provider === 'trade_republic' && c.is_active)

  const sync = useMutation({
    mutationFn: () => connectorsApi.trSync(),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: ['connectors'] }); qc.invalidateQueries({ queryKey: ['assets'] }); qc.invalidateQueries({ queryKey: ['dashboard-summary'] }); alert(r.data.message) },
    onError: (e: any) => alert(e.response?.data?.detail || 'Erreur de synchronisation'),
  })
  const disc = useMutation({ mutationFn: () => connectorsApi.trDisconnect(), onSuccess: () => qc.invalidateQueries({ queryKey: ['connectors'] }) })

  const initTR = async () => {
    if (!phone) return; setLoading(true); setErr('')
    try { await connectorsApi.trInit(phone); setStep('otp') }
    catch (e: any) { setErr(e.response?.data?.detail || 'Erreur') }
    finally { setLoading(false) }
  }
  const confirmOTP = async () => {
    if (!otp) return; setLoading(true); setErr('')
    try { await connectorsApi.trConfirmOTP(phone, otp); qc.invalidateQueries({ queryKey: ['connectors'] }); setStep('done') }
    catch (e: any) { setErr(e.response?.data?.detail || 'Code OTP invalide') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text-primary text-2xl font-bold">Connecteurs</h1>
        <p className="text-text-secondary text-sm mt-1">Synchronisez vos comptes avec vos plateformes financières</p>
      </div>
      <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-xl px-5 py-4 flex gap-3">
        <AlertCircle size={18} className="text-accent-purple-light shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-accent-purple-light font-medium mb-1">Connexion sécurisée</p>
          <p className="text-text-secondary">Vos mots de passe ne sont <strong>jamais stockés</strong>. Seul un token de session chiffré est conservé localement. L'authentification Trade Republic utilise un OTP envoyé sur votre téléphone.</p>
        </div>
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0DC672]/10 flex items-center justify-center"><span className="text-[#0DC672] font-bold text-lg">TR</span></div>
            <div><h3 className="text-text-primary font-semibold">Trade Republic</h3><p className="text-text-muted text-sm">Actions, ETF, crypto &amp; obligations</p></div>
          </div>
          {trConn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-success text-sm"><CheckCircle size={16}/>Connecté</div>
              {trConn.last_sync && <span className="text-text-muted text-xs">Sync : {formatDate(trConn.last_sync)}</span>}
              <Button variant="secondary" size="sm" onClick={() => sync.mutate()} loading={sync.isPending}><RefreshCw size={14}/>Synchroniser</Button>
              <Button variant="danger" size="sm" onClick={() => { if(confirm('Déconnecter Trade Republic ?')) disc.mutate() }}><Trash2 size={14}/></Button>
            </div>
          ) : (
            <Button onClick={() => setStep('phone')}><Plug size={14}/>Connecter</Button>
          )}
        </div>
      </Card>
      <div>
        <h2 className="text-text-secondary text-sm font-medium uppercase tracking-wider mb-3">À venir</h2>
        <div className="space-y-2 opacity-50">
          {['Boursorama','Crédit Agricole','BNP Paribas','Société Générale'].map((b) => (
            <Card key={b} className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center"><span className="text-text-muted text-xs font-bold">{b[0]}</span></div><div><p className="text-text-primary text-sm font-medium">{b}</p><p className="text-text-muted text-xs">Connexion PSD2 — bientôt disponible</p></div></div>
              <ChevronRight size={16} className="text-text-muted"/>
            </Card>
          ))}
        </div>
      </div>
      <Modal open={step!=='idle'} onClose={() => { setStep('idle'); setErr('') }} title="Connexion Trade Republic">
        {step==='phone' && <div className="space-y-4">
          <p className="text-text-secondary text-sm">Entrez votre numéro de téléphone Trade Republic. Vous recevrez un code OTP par notification push.</p>
          <Input label="Numéro de téléphone" placeholder="+33612345678" value={phone} onChange={(e)=>setPhone(e.target.value)} hint="Format international : +33XXXXXXXXX" />
          {err && <p className="text-danger text-sm bg-danger/10 rounded-lg px-4 py-2">{err}</p>}
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={()=>setStep('idle')}>Annuler</Button><Button onClick={initTR} loading={loading}>Envoyer le code OTP</Button></div>
        </div>}
        {step==='otp' && <div className="space-y-4">
          <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-3"><p className="text-success text-sm font-medium">Code OTP envoyé !</p><p className="text-text-secondary text-sm mt-1">Vérifiez vos notifications Trade Republic.</p></div>
          <Input label="Code OTP" placeholder="000000" value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={10} />
          {err && <p className="text-danger text-sm bg-danger/10 rounded-lg px-4 py-2">{err}</p>}
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={()=>setStep('phone')}>Retour</Button><Button onClick={confirmOTP} loading={loading}>Valider</Button></div>
        </div>}
        {step==='done' && <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={32} className="text-success"/></div>
          <div><p className="text-text-primary font-semibold text-lg">Trade Republic connecté !</p><p className="text-text-secondary text-sm mt-1">Utilisez le bouton "Synchroniser" pour importer vos positions.</p></div>
          <Button onClick={()=>setStep('idle')} className="mx-auto">Fermer</Button>
        </div>}
      </Modal>
    </div>
  )
}
