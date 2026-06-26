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
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
      <path fill="#00A1D6" d="M7.2 4.1a1 1 0 0 1 1.4.1l1.8 2h3.2l1.8-2a1 1 0 1 1 1.5 1.3l-.7.7h1.4A3.4 3.4 0 0 1 21 9.6v6.1a3.4 3.4 0 0 1-3.4 3.4H6.4A3.4 3.4 0 0 1 3 15.7V9.6a3.4 3.4 0 0 1 3.4-3.4h1.4l-.7-.7a1 1 0 0 1 .1-1.4Z" />
      <rect x="5.3" y="8.2" width="13.4" height="8.8" rx="2.1" fill="#fff" />
      <path stroke="#00A1D6" strokeLinecap="round" strokeWidth="1.8" d="M9 11.2v2.2m6-2.2v2.2m-4.2 1.8h2.4" />
    </svg>
  }
  if (type === 'xiaohongshu') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4" fill="#FF2442" />
      <path fill="#fff" d="M7.1 8.1h9.8v1.8H13v1.1h3.3v1.7H13v1.6h4.4v1.8H6.6v-1.8h4.3v-1.6H7.7V11h3.2V9.9H7.1V8.1Z" />
      <path fill="#fff" d="M8.2 17.1c1.8-.5 2.9-1.2 3.8-2.3l1.6.8c-1 1.4-2.4 2.4-4.4 3.1l-1-1.6Zm7.6 1.5c-.8-.9-1.7-1.6-2.8-2.2l1.2-1.2c1.2.5 2.2 1.2 3 2.1l-1.4 1.3Z" opacity=".95" />
    </svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
    <path fill="#5865F2" d="M18.7 5.7A16 16 0 0 0 14.8 4l-.5 1a14.8 14.8 0 0 0-4.6 0L9.2 4a16 16 0 0 0-3.9 1.7C2.8 9.4 2.1 13 2.4 16.6A15.8 15.8 0 0 0 7.2 19l1-1.4c-.6-.2-1.1-.5-1.6-.8l.4-.3c3.1 1.5 6.7 1.5 9.8 0l.4.3c-.5.3-1 .6-1.6.8l1 1.4a15.8 15.8 0 0 0 4.9-2.4c.3-4.2-.8-7.8-2.8-10.9Z" />
    <circle cx="9.2" cy="12.6" r="1.25" fill="#fff" />
    <circle cx="14.8" cy="12.6" r="1.25" fill="#fff" />
    <path stroke="#fff" strokeLinecap="round" strokeWidth="1.5" d="M9.2 15.4c1.8.8 3.8.8 5.6 0" />
  </svg>
}
