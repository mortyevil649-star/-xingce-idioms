import { ArrowLeft, KeyRound, LockKeyhole, Mail, UserPlus } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface LocationState { from?: { pathname?: string; search?: string } }

function getReturnTo(state: unknown) {
  const from = (state as LocationState | null)?.from
  const path = from?.pathname && !from.pathname.startsWith('/admin') ? from.pathname : '/'
  return `${path}${from?.search ?? ''}`
}

function AuthShell({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode }) {
  return <div className="grid min-h-[calc(100vh-9rem)] place-items-center px-0 py-4 sm:px-4">
    <div className="paper w-full max-w-md min-w-0 rounded-2xl p-5 sm:rounded-3xl sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">{icon}</div>
      <h1 className="mt-5 text-2xl font-bold text-indigo-950">{title}</h1>
      <p className="mt-2 text-[15px] leading-6 text-slate-500">{subtitle}</p>
      {children}
    </div>
  </div>
}

function Field({ label, type, value, onChange, autoComplete }: { label: string; type: string; value: string; onChange: (value: string) => void; autoComplete?: string }) {
  return <label className="mt-4 block text-sm font-bold text-slate-700">
    {label}
    <input
      type={type}
      required
      value={value}
      autoComplete={autoComplete}
      onChange={event => onChange(event.target.value)}
      className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal outline-none"
    />
  </label>
}

function Message({ value, danger = false }: { value: string; danger?: boolean }) {
  if (!value) return null
  return <p className={`mt-4 break-words rounded-xl p-3 text-sm leading-6 ${danger ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{value}</p>
}

export function LoginPage() {
  const { signIn, configured, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = useMemo(() => getReturnTo(location.state), [location.state])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) navigate(returnTo, { replace: true })
  }, [user, navigate, returnTo])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后再试。')
    } finally {
      setBusy(false)
    }
  }

  return <AuthShell title="登录" subtitle="登录后可以同步收藏、学习状态、笔记和我的例句。" icon={<LockKeyhole />}>
    {!configured && <Message danger value="Supabase 环境变量缺失，请先配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY。" />}
    <form onSubmit={event => void submit(event)} className="mt-6">
      <Field label="邮箱" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="密码" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      <button disabled={busy || !configured} className="btn btn-primary mt-6 w-full disabled:opacity-50">{busy ? '正在登录…' : '登录'}</button>
    </form>
    <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
      <Link to="/register" state={{ from: location.state && (location.state as LocationState).from }} className="focus-ring min-h-11 rounded-lg px-3 py-2 font-bold text-indigo-700">没有账号？注册</Link>
      <Link to="/forgot-password" className="focus-ring min-h-11 rounded-lg px-3 py-2 font-bold text-slate-500 sm:text-right">忘记密码？</Link>
    </div>
    <Link to="/" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-slate-500"><ArrowLeft size={15}/>返回首页</Link>
  </AuthShell>
}

export function RegisterPage() {
  const { signUp, configured } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (password.length < 8) {
      setError('密码至少 8 位。')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致。')
      return
    }
    setBusy(true)
    try {
      const result = await signUp(email.trim(), password)
      setMessage(result.needsEmailConfirmation ? '注册成功，请前往邮箱完成验证后再登录。' : '注册成功，已自动登录。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后再试。')
    } finally {
      setBusy(false)
    }
  }

  return <AuthShell title="注册" subtitle="创建前台学习账号，用来同步收藏、笔记和复习记录。" icon={<UserPlus />}>
    {!configured && <Message danger value="Supabase 环境变量缺失，请先配置前端环境变量。" />}
    <form onSubmit={event => void submit(event)} className="mt-6">
      <Field label="邮箱" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field label="密码" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <p className="mt-2 text-xs text-slate-400">密码至少 8 位。</p>
      <Field label="确认密码" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <Message value={message} />
      <Message danger value={error} />
      <button disabled={busy || !configured} className="btn btn-primary mt-6 w-full disabled:opacity-50">{busy ? '正在注册…' : '注册'}</button>
    </form>
    <Link to="/login" state={location.state} className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-indigo-700">已有账号？去登录</Link>
  </AuthShell>
}

export function ForgotPasswordPage() {
  const { sendPasswordReset, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setBusy(true)
    try {
      await sendPasswordReset(email.trim())
      setMessage('重置密码邮件已发送。请打开邮箱中的链接继续设置新密码。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败，请确认邮箱后再试。')
    } finally {
      setBusy(false)
    }
  }

  return <AuthShell title="找回密码" subtitle="输入注册邮箱，我们会通过 Supabase 发送密码重置邮件。" icon={<Mail />}>
    <form onSubmit={event => void submit(event)} className="mt-6">
      <Field label="邮箱" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Message value={message} />
      <Message danger value={error || (!configured ? 'Supabase 环境变量缺失，请先配置前端环境变量。' : '')} />
      <button disabled={busy || !configured} className="btn btn-primary mt-6 w-full disabled:opacity-50">{busy ? '正在发送…' : '发送重置密码邮件'}</button>
    </form>
    <Link to="/login" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-indigo-700">返回登录</Link>
  </AuthShell>
}

export function ResetPasswordPage() {
  const { updatePassword, configured } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('新密码至少 8 位。')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致。')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      navigate('/login', { replace: true, state: { updatedPassword: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新密码失败，请重新打开邮件链接。')
    } finally {
      setBusy(false)
    }
  }

  return <AuthShell title="设置新密码" subtitle="请输入新密码。完成后请使用新密码登录。" icon={<KeyRound />}>
    <form onSubmit={event => void submit(event)} className="mt-6">
      <Field label="新密码" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
      <Field label="确认新密码" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <Message danger value={error || (!configured ? 'Supabase 环境变量缺失，请先配置前端环境变量。' : '')} />
      <button disabled={busy || !configured} className="btn btn-primary mt-6 w-full disabled:opacity-50">{busy ? '正在更新…' : '更新密码'}</button>
    </form>
  </AuthShell>
}
