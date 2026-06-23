import { Link, Route, Routes } from 'react-router-dom'
import { AdminGuard } from './components/AdminLayout'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { IdiomDetail } from './pages/IdiomDetail'
import { IdiomList } from './pages/IdiomList'
import { Quiz } from './pages/Quiz'
import { AdminIdiomFormPage } from './pages/admin/AdminIdiomForm'
import { AdminIdiomListPage } from './pages/admin/AdminIdiomListPage'
import { AdminLoginPage } from './pages/admin/AdminLogin'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/auth/AuthPages'

export default function App() {
  return <Routes>
    <Route path="/admin/login" element={<AdminLoginPage />} />

    <Route path="/admin" element={<AdminGuard />}>
      <Route index element={<AdminIdiomListPage />} />
      <Route path="idioms/new" element={<AdminIdiomFormPage />} />
      <Route path="idioms/:id/edit" element={<AdminIdiomFormPage />} />
    </Route>

    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/idioms" element={<IdiomList />} />
      <Route path="/idioms/:id" element={<IdiomDetail />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}

function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-5"><div className="paper rounded-2xl p-8 text-center"><h1 className="text-xl font-bold text-indigo-950">页面不存在</h1><Link to="/" className="btn btn-primary mt-5">返回首页</Link></div></main>
}
