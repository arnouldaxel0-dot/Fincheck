import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function Login() {
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(username, password, email||undefined)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent-purple flex items-center justify-center"><span className="text-white font-bold text-lg">F</span></div>
          <span className="text-text-primary font-bold text-2xl tracking-tight">Fincheck</span>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-8">
          <h1 className="text-text-primary font-semibold text-xl mb-1">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
          <p className="text-text-secondary text-sm mb-6">{mode === 'login' ? 'Accédez à votre tableau de bord financier' : 'Commencez à suivre votre patrimoine'}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nom d'utilisateur" placeholder="votre_nom" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            {mode === 'register' && <Input label="Email (optionnel)" type="email" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} />}
            <Input label="Mot de passe" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>}
            <Button type="submit" className="w-full" size="lg" loading={loading}>{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-text-muted">
            {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-accent-purple hover:text-accent-purple-light font-medium">{mode === 'login' ? 'Créer un compte' : 'Se connecter'}</button>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-text-muted">Toutes vos données restent sur votre appareil local</p>
      </div>
    </div>
  )
}
