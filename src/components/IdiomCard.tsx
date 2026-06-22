import { Bookmark, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Idiom } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { Pronunciation } from './Pronunciation'

export function IdiomCard({ idiom }: { idiom: Idiom }) {
  const { user } = useAuth()
  const { records, examples, saveStudy } = useStudy()
  const record = records[idiom.id]
  const hasNote = Boolean(record?.personal_note || record?.personal_mistake_reminder || examples[idiom.id]?.length)
  const update = async (patch: Parameters<typeof saveStudy>[1]) => {
    if (!user) return
    await saveStudy(idiom.id, patch)
  }
  return <article className="paper paper-hover relative rounded-2xl p-5">
    <button aria-label={record?.is_favorite?'取消收藏':'收藏'} disabled={!user} title={!user?'登录后可收藏':undefined} onClick={() => void update({is_favorite:!record?.is_favorite})} className={`focus-ring absolute right-4 top-4 rounded-full p-2 disabled:cursor-not-allowed disabled:opacity-40 ${record?.is_favorite?'bg-amber-100 text-amber-600':'bg-slate-50 text-slate-400'}`}><Bookmark size={18} fill={record?.is_favorite?'currentColor':'none'}/></button>
    <Link to={`/idioms/${idiom.id}`} className="block pr-10"><div className="flex flex-wrap items-center gap-2"><h2 className="display text-2xl font-bold text-indigo-950">{idiom.title}</h2>{hasNote&&<span className="chip bg-amber-100 text-amber-800">有笔记</span>}</div><Pronunciation value={idiom.key_pronunciations}/><p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">{idiom.meaning}</p><div className="mt-4 flex flex-wrap gap-2"><span className="chip bg-indigo-50 text-indigo-700">{idiom.category}</span><span className="chip bg-slate-100 text-slate-600">{idiom.difficulty}</span>{idiom.tags.slice(0,2).map(tag=><span key={tag} className="chip border border-slate-200 text-slate-500">#{tag}</span>)}</div></Link>
    <button disabled={!user} title={!user?'登录后可记录进度':undefined} onClick={() => void update({status:record?.status==='已掌握'?'未学':'已掌握'})} className={`focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${record?.status==='已掌握'?'bg-emerald-100 text-emerald-700':'bg-slate-50 text-slate-500 hover:bg-emerald-50'}`}><Check size={16}/>{record?.status==='已掌握'?'已掌握':user?'标记为已掌握':'登录后记录'}</button>
  </article>
}
