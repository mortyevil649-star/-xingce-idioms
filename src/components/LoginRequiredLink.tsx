import { LogIn } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function LoginRequiredLink({ label = '登录后记录学习进度', className = '' }: { label?: string; className?: string }) {
  const location = useLocation()
  return <Link
    to="/login"
    state={{ from: { pathname: location.pathname, search: location.search } }}
    className={`btn btn-primary ${className}`}
  >
    <LogIn size={17} />{label}
  </Link>
}
