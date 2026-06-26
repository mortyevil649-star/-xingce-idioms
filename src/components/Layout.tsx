import { BookOpen, House, LogIn, LogOut, Settings, Shuffle, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmDialog } from './ConfirmDialog'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  ['/', '首页', House],
  ['/idioms', '成语库', BookOpen],
  ['/quiz', '随机抽查', Shuffle],
] as const

const friendLinks = [
  ['国家公务员局', 'https://www.scs.gov.cn/'],
  ['中国人事考试网', 'http://www.cpta.com.cn/'],
  ['粉笔公考', 'https://www.fenbi.com/page/home'],
  ['公考雷达', 'https://www.gongkaoleida.com/'],
  ['汉典', 'https://www.zdic.net/'],
  ['百度汉语', 'https://hanyu.baidu.com/'],
  ['汉程成语', 'https://cy.httpcn.com/'],
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
            <ThemeToggle />
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
    <footer className="mx-auto max-w-6xl px-3 py-7 text-center text-xs text-slate-400 sm:px-4 sm:py-8">
      <div className="paper mb-5 rounded-2xl px-4 py-4 text-left sm:px-5">
        <p className="text-xs font-bold tracking-widest text-slate-500">友情链接</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {friendLinks.map(([label, href]) => <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="chip status-idle hover:text-indigo-700"
          >
            {label}
          </a>)}
        </div>
      </div>
      <p>行测成语积累 · 学得慢一点，记得牢一点</p>
    </footer>
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
