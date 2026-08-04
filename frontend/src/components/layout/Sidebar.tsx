import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wallet, TrendingDown, Plug, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/actifs', icon: Wallet, label: 'Actifs' },
  { to: '/passifs', icon: TrendingDown, label: 'Crédits & Passifs' },
  { to: '/connecteurs', icon: Plug, label: 'Connecteurs' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border flex flex-col z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
        <span className="text-text-primary font-semibold text-lg tracking-tight">Fincheck</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all', isActive ? 'bg-accent-purple/10 text-accent-purple-light' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary')}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center"><span className="text-accent-purple text-sm font-semibold">{user?.username?.[0]?.toUpperCase()}</span></div>
          <div className="flex-1 min-w-0"><p className="text-text-primary text-sm font-medium truncate">{user?.username}</p><p className="text-text-muted text-xs">Compte local</p></div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-hover hover:text-danger transition-all">
          <LogOut size={16} />Déconnexion
        </button>
      </div>
    </aside>
  )
}
