import { ArrowRight, BookOpen, Check, TriangleAlert } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoginRequiredLink } from '../components/LoginRequiredLink'
import { Pronunciation } from '../components/Pronunciation'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { useIdioms } from '../hooks/useIdioms'
import type { Idiom } from '../types/database'

const today = () => new Date().toISOString().slice(0, 10)

function priority(idiom: Idiom, records: ReturnType<typeof useStudy>['records']) {
  const record = records[idiom.id]
  if (!record) return 9
  if (record.next_review && record.next_review <= today()) return 0
  if (record.status === '易错') return 1
  if (record.status === '已掌握') return 2
  return 8
}

export function Review() {
  const [params] = useSearchParams()
  const count = Math.max(1, Math.min(50, Number(params.get('count') || 10)))
  const { user } = useAuth()
  const { idioms, loading } = useIdioms()
  const { records, saveStudy } = useStudy()
  const pool = idioms
    .filter(idiom => records[idiom.id] && priority(idiom, records) < 8)
    .sort((a, b) => priority(a, records) - priority(b, records) || a.sort_order - b.sort_order)
    .slice(0, count)
  const estimatedMinutes = Math.max(1, Math.ceil(count * 0.75))

  const mark = async (idiomId: string, status: '已掌握' | '易错') => {
    await saveStudy(idiomId, { status, next_review: status === '已掌握' ? null : records[idiomId]?.next_review ?? null })
  }

  if (loading) return <div className="text-center text-slate-500">正在准备复习组…</div>

  return <div className="mx-auto w-full max-w-4xl">
    <div className="paper rounded-2xl p-5 sm:rounded-3xl sm:p-8">
      <p className="text-sm font-bold text-indigo-600">每日复习</p>
      <h1 className="display mt-2 text-3xl font-bold leading-tight text-indigo-950 sm:text-4xl">今天先复习这一组</h1>
      <p className="mt-3 text-[15px] leading-7 text-slate-500">本组 {count} 个，预计约 {estimatedMinutes} 分钟。优先包含到期复习、易错和已掌握成语。</p>
      {!user && <div className="mt-5 rounded-2xl bg-indigo-50 p-4"><p className="mb-3 text-sm leading-6 text-slate-600">登录后才能读取你的复习记录并同步结果。</p><LoginRequiredLink className="w-full sm:w-auto" /></div>}
    </div>

    {user && !pool.length && <div className="paper mt-5 rounded-2xl p-8 text-center text-slate-500">
      <BookOpen className="mx-auto text-indigo-600" />
      <p className="mt-4">暂时没有复习任务。可以先去成语库学习并标记掌握或易错。</p>
      <Link to="/idioms" className="btn btn-primary mt-5 w-full sm:w-auto">去学习新成语 <ArrowRight size={17} /></Link>
    </div>}

    {user && Boolean(pool.length) && <div className="mt-5 grid gap-4">
      {pool.map((idiom, index) => {
        const record = records[idiom.id]
        const due = record?.next_review && record.next_review <= today()
        return <article key={idiom.id} className="paper min-w-0 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">第 {index + 1} 个</p>
              <h2 className="display mt-1 break-words text-2xl font-bold text-indigo-950">{idiom.title}</h2>
              <Pronunciation value={idiom.key_pronunciations} />
            </div>
            <span className={`chip ${record?.status === '易错' ? 'bg-rose-50 text-rose-700' : due ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>{due ? '到期复习' : record?.status ?? '复习'}</span>
          </div>
          <p className="mt-4 break-words text-[15px] leading-8 text-slate-600">{idiom.meaning}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <button onClick={() => void mark(idiom.id, '已掌握')} className="btn w-full bg-emerald-100 text-emerald-700"><Check size={17} />已掌握</button>
            <button onClick={() => void mark(idiom.id, '易错')} className="btn btn-danger w-full"><TriangleAlert size={17} />仍易错</button>
            <Link to={`/idioms/${idiom.id}`} className="btn btn-soft w-full sm:w-auto">看详情</Link>
          </div>
        </article>
      })}
    </div>}
  </div>
}
