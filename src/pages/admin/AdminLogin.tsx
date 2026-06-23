import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AdminLoginPage(){
  const {user,isAdmin,loading,configured,signIn}=useAuth(),navigate=useNavigate()
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  if(!loading&&user&&isAdmin)return <Navigate to="/admin" replace/>
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setBusy(true);setError('');try{await signIn(email,password);navigate('/admin')}catch(reason){setError(reason instanceof Error?reason.message:'登录失败')}finally{setBusy(false)}}
  return <div className="grid min-h-screen min-w-0 place-items-center bg-slate-100 p-3 sm:p-4"><form onSubmit={event=>void submit(event)} className="paper w-full max-w-sm min-w-0 rounded-2xl p-5 sm:rounded-3xl sm:p-9"><div className="flex size-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><LockKeyhole/></div><h1 className="mt-5 text-2xl font-bold text-indigo-950">管理员登录</h1><p className="mt-2 text-[15px] leading-6 text-slate-500">仅限已在 Supabase 创建并设为 admin 的账号。</p>{!configured&&<p className="mt-4 break-words rounded-lg bg-rose-50 p-3 text-sm text-rose-700">环境变量缺失，请先配置 Supabase。</p>}<label className="mt-6 block text-sm font-bold text-slate-700">邮箱<input type="email" required value={email} onChange={event=>setEmail(event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 p-3 font-normal"/></label><label className="mt-4 block text-sm font-bold text-slate-700">密码<input type="password" required value={password} onChange={event=>setPassword(event.target.value)} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 p-3 font-normal"/></label>{error&&<p className="mt-4 break-words text-sm text-rose-600">{error}</p>}<button disabled={busy||!configured} className="btn btn-primary mt-6 w-full disabled:opacity-50">{busy?'正在登录…':'登录'}</button></form></div>
}
