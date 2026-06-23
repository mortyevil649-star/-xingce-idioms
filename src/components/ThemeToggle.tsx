import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const storageKey = 'xingce-theme'

function preferredDark() {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(storageKey)
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => preferredDark())

  useEffect(() => {
    applyTheme(isDark)
    window.localStorage.setItem(storageKey, isDark ? 'dark' : 'light')
  }, [isDark])

  return <button
    type="button"
    onClick={() => setIsDark(value => !value)}
    className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-indigo-700"
    aria-label={isDark ? '切换浅色模式' : '切换深色模式'}
    title={isDark ? '切换浅色模式' : '切换深色模式'}
  >
    {isDark ? <Sun size={17} /> : <Moon size={17} />}
    <span className="hidden sm:ml-1 sm:inline">{isDark ? '浅色' : '深色'}</span>
  </button>
}

export function initTheme() {
  applyTheme(preferredDark())
}
