import { BookOpen, House, LogIn, LogOut, Settings, Shuffle, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmDialog } from './ConfirmDialog'

const nav = [
  ['/', '首页', House],
  ['/idioms', '成语库', BookOpen],
  ['/quiz', '随机抽查', Shuffle],
] as const

export function Layout() {
  const { user, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)

  return <div className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
        <NavLink to="/" className="display min-w-0 truncate text-base font-bold tracking-wide text-indigo-950 sm:text-xl sm:tracking-wider">行测成语积累</NavLink>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
          <nav className="flex shrink-0 gap-1">
            {nav.map(([to, label, Icon]) => <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `focus-ring flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold sm:px-3 ${isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-500 hover:text-indigo-700'}`}
            >
              <Icon size={17} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>)}
          </nav>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
            {!user ? <NavLink
              to="/login"
              state={{ from: { pathname: location.pathname, search: location.search } }}
              className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-bold text-white"
            >
              <LogIn size={16} />登录
            </NavLink> : <>
              <NavLink to="/idioms" className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                <UserRound size={16} /><span className="hidden min-[390px]:inline">我的学习</span>
              </NavLink>
              {isAdmin && <NavLink to="/admin" className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                <Settings size={16} /><span className="hidden sm:inline">管理后台</span>
              </NavLink>}
              <button onClick={() => setConfirmingSignOut(true)} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:text-rose-600">
                <LogOut size={16} /><span className="hidden min-[390px]:inline">退出</span>
              </button>
            </>}
          </div>
        </div>
      </div>
    </header>
    <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4 sm:py-10"><Outlet /></main>
    <footer className="mx-auto max-w-6xl px-3 py-7 text-center text-xs text-slate-400 sm:px-4 sm:py-8">行测成语积累 · 学得慢一点，记得牢一点</footer>
    <ConfirmDialog
      open={confirmingSignOut}
      title="退出登录？"
      description="退出后，本机将不再显示当前账号的学习记录；重新登录后可以继续同步。"
      cancelText="继续学习"
      confirmText="退出登录"
      onCancel={() => setConfirmingSignOut(false)}
      onConfirm={() => {
        setConfirmingSignOut(false)
        void signOut()
      }}
    />
  </div>
}
