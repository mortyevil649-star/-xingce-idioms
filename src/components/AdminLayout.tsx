import { BookOpen, LogOut, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ConfirmDialog } from './ConfirmDialog'

export function AdminGuard() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const confirmSignOut = () => setConfirmingSignOut(true)
  const dialog = <ConfirmDialog
    open={confirmingSignOut}
    title="退出登录？"
    description="退出后会离开当前账号，需要重新登录才能继续管理或同步学习记录。"
    cancelText="取消"
    confirmText="退出登录"
    onCancel={() => setConfirmingSignOut(false)}
    onConfirm={() => {
      setConfirmingSignOut(false)
      void signOut()
    }}
  />

  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-500">正在验证权限…</div>
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <div className="grid min-h-screen place-items-center bg-slate-100 p-4 sm:p-5">
    <div className="paper w-full max-w-md rounded-2xl p-6 text-center sm:p-8">
      <h1 className="text-xl font-bold text-slate-900">无管理权限</h1>
      <p className="mt-3 break-all text-sm text-slate-500">当前账号 {user.email} 不是管理员。</p>
      <button onClick={confirmSignOut} className="btn btn-primary mt-6 w-full sm:w-auto">退出登录</button>
    </div>
    {dialog}
  </div>

  return <div className="min-h-screen min-w-0 bg-slate-100">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4">
        <Link to="/admin" className="min-w-0 truncate text-sm font-bold text-indigo-950 sm:text-base">行测成语管理台</Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span className="hidden max-w-48 truncate text-xs text-slate-500 md:inline">{user.email}</span>
          <Link to="/admin/idioms/new" className="btn btn-primary px-3 py-2 text-sm"><Plus size={16} />新增</Link>
          <button onClick={confirmSignOut} className="focus-ring flex size-11 items-center justify-center rounded-lg text-slate-500" aria-label="退出登录"><LogOut size={18} /></button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-3 pb-3 sm:px-4">
        <Link to="/admin" className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"><BookOpen size={15} />成语管理</Link>
        <Link to="/" className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-slate-500">查看网站</Link>
      </nav>
    </header>
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-6"><Outlet /></main>
    {dialog}
  </div>
}
