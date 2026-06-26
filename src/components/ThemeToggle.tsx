import { Leaf, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const storageKey = 'xingce-theme'
type ThemeMode = 'light' | 'dark' | 'eye'

function preferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(storageKey)
  if (stored === 'dark' || stored === 'light' || stored === 'eye') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.classList.toggle('eye', mode === 'eye')
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => preferredTheme())
  const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'eye' : 'light'
  const label = mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '护眼'
  const nextLabel = nextMode === 'light' ? '浅色' : nextMode === 'dark' ? '深色' : '护眼'

  useEffect(() => {
    applyTheme(mode)
    window.localStorage.setItem(storageKey, mode)
  }, [mode])

  return <button
    type="button"
    onClick={() => setMode(nextMode)}
    className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-indigo-700"
    aria-label={`切换到${nextLabel}模式`}
    title={`切换到${nextLabel}模式`}
  >
    {mode === 'light' ? <Sun size={17} /> : mode === 'dark' ? <Moon size={17} /> : <Leaf size={17} />}
    <span className="hidden sm:ml-1 sm:inline">{label}</span>
  </button>
}

export function initTheme() {
  applyTheme(preferredTheme())
}
