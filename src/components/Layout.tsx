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

const socialLinks = [
  ['B站', 'https://space.bilibili.com/85167755?spm_id_from=333.40164.0.0', 'bilibili'],
  ['小红书', 'https://www.xiaohongshu.com/user/profile/62dbc5d1000000001e01db70', 'xiaohongshu'],
  ['Discord', 'https://discord.com/channels/1520097496561352826/1520097497182240810', 'discord'],
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
      <div className="mb-5 flex flex-col items-center gap-4">
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-500">关注我</p>
          <div className="flex items-center justify-center gap-3">
            {socialLinks.map(([label, href, type]) => <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="focus-ring flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <SocialIcon type={type} />
            </a>)}
          </div>
        </div>
        <NavLink to="/friend-links" className="text-xs text-slate-400 hover:text-indigo-700">
          友情链接
        </NavLink>
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

function SocialIcon({ type }: { type: typeof socialLinks[number][2] }) {
  if (type === 'bilibili') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5 6 3" />
      <path d="m16 5 2-2" />
      <rect x="3.5" y="6" width="17" height="13" rx="3" />
      <path d="M9 11v3" />
      <path d="M15 11v3" />
      <path d="M10 17h4" />
    </svg>
  }
  if (type === 'xiaohongshu') {
    return <span aria-hidden="true" className="text-sm font-black leading-none">书</span>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
    <path d="M8.7 7.5c2.2-.7 4.4-.7 6.6 0 .3.1.5.3.6.6l1.3 6.1c.1.4-.2.8-.6.9-1 .2-2 .1-2.8-.4-.2-.1-.3-.3-.4-.5l-.3-.7a8.4 8.4 0 0 1-2.2 0l-.3.7c-.1.2-.2.4-.4.5-.9.5-1.8.6-2.8.4-.4-.1-.7-.5-.6-.9l1.3-6.1c.1-.3.3-.5.6-.6Z" />
    <circle cx="9.8" cy="11.5" r="1" />
    <circle cx="14.2" cy="11.5" r="1" />
  </svg>
}
