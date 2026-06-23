import { Bookmark, Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { Idiom } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { Pronunciation } from './Pronunciation'
import { LoginRequiredLink } from './LoginRequiredLink'
import { getExamFrequencyLabel } from '../lib/examFrequency'

export function IdiomCard({ idiom }: { idiom: Idiom }) {
  const { user } = useAuth()
  const location = useLocation()
  const { records, examples, saveStudy } = useStudy()
  const record = records[idiom.id]
  const hasNote = Boolean(record?.personal_note || record?.personal_mistake_reminder || examples[idiom.id]?.length)
  const mastered = record?.status === '已掌握'
  const frequencyLabel = getExamFrequencyLabel(idiom)
  const update = async (patch: Parameters<typeof saveStudy>[1]) => {
    if (!user) return
    await saveStudy(idiom.id, patch)
  }

  return <article className="paper paper-hover relative min-w-0 rounded-2xl p-4 sm:p-5">
    {user ? <button
      aria-label={record?.is_favorite ? '取消收藏' : '收藏'}
      onClick={() => void update({ is_favorite: !record?.is_favorite })}
      className={`focus-ring absolute right-3 top-3 flex size-11 items-center justify-center rounded-full sm:right-4 sm:top-4 ${record?.is_favorite ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}
    >
      <Bookmark size={18} fill={record?.is_favorite ? 'currentColor' : 'none'} />
    </button> : <Link
      to="/login"
      state={{ from: { pathname: location.pathname, search: location.search } }}
      aria-label="登录后收藏"
      className="focus-ring absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-slate-50 text-slate-400 sm:right-4 sm:top-4"
    >
      <Bookmark size={18} />
    </Link>}
    <Link to={`/idioms/${idiom.id}`} className="block min-w-0 pr-12">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className="display break-words text-2xl font-bold text-indigo-950">{idiom.title}</h2>
        {hasNote && <span className="chip bg-amber-100 text-amber-800">有笔记</span>}
      </div>
      <Pronunciation value={idiom.key_pronunciations} />
      <p className="mt-4 line-clamp-2 text-[15px] leading-7 text-slate-600 sm:text-base">{idiom.meaning}</p>
      <div className="mt-4 flex min-w-0 flex-wrap gap-2">
        <span className="chip bg-indigo-50 text-indigo-700">{idiom.category}</span>
        <span className="chip bg-slate-100 text-slate-600">{idiom.difficulty}</span>
        {frequencyLabel && <span className="chip bg-amber-50 text-amber-700">{frequencyLabel}</span>}
        {idiom.tags.slice(0, 2).map(tag => <span key={tag} className="chip border border-slate-200 text-slate-500">#{tag}</span>)}
      </div>
    </Link>
    {user ? <button
      onClick={() => void update({ status: mastered ? '未学' : '已掌握' })}
      className={`focus-ring mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${mastered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50'}`}
    >
      <Check size={16} />{mastered ? '已掌握' : '标记为已掌握'}
    </button> : <LoginRequiredLink className="mt-5 w-full" />}
  </article>
}
