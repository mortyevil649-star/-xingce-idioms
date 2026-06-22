import { BookOpen, LogOut, Plus } from 'lucide-react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminGuard() {
  const {user,isAdmin,loading,signOut}=useAuth()
  if(loading)return <div className="grid min-h-screen place-items-center text-slate-500">正在验证管理权限…</div>
  if(!user)return <Navigate to="/admin/login" replace/>
  if(!isAdmin)return <div className="grid min-h-screen place-items-center bg-slate-100 p-5"><div className="paper max-w-md rounded-2xl p-8 text-center"><h1 className="text-xl font-bold text-slate-900">无管理权限</h1><p className="mt-3 text-sm text-slate-500">当前账号 {user.email} 不是管理员。</p><button onClick={()=>void signOut()} className="btn btn-primary mt-6">退出登录</button></div></div>
  return <div className="min-h-screen bg-slate-100"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3"><Link to="/admin" className="font-bold text-indigo-950">行测成语管理台</Link><div className="flex items-center gap-2"><span className="hidden text-xs text-slate-500 sm:inline">{user.email}</span><Link to="/admin/idioms/new" className="btn btn-primary px-3 py-2 text-sm"><Plus size={16}/>新增</Link><button onClick={()=>void signOut()} className="focus-ring rounded-lg p-2 text-slate-500" aria-label="退出登录"><LogOut size={18}/></button></div></div><nav className="mx-auto flex max-w-7xl gap-2 px-4 pb-3"><Link to="/admin" className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"><BookOpen size={15}/>成语管理</Link><Link to="/" className="rounded-lg px-3 py-2 text-sm text-slate-500">查看网站</Link></nav></header><main className="mx-auto max-w-7xl px-4 py-6"><Outlet/></main></div>
}
