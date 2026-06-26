import { ArrowRight, BookOpen, CheckCircle2, Clock3, Shuffle, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { examConfig } from '../config/exam'
import { Pronunciation } from '../components/Pronunciation'
import { useStudy } from '../contexts/StudyContext'
import { useIdioms } from '../hooks/useIdioms'

export function Home() {
  const { idioms, loading, error } = useIdioms()
  const { records } = useStudy()
  const [reviewSize, setReviewSize] = useState(10)
  const [, setTick] = useState(0)
  useEffect(() => { const timer = setInterval(() => setTick(value => value + 1), 60000); return () => clearInterval(timer) }, [])
  const days = Math.max(0, Math.ceil((new Date(examConfig.targetDate).getTime() - Date.now()) / 86400000))
  const recordValues = Object.values(records)
  const mastered = recordValues.filter(item => item.status === '已掌握').length
  const mistakes = recordValues.filter(item => item.status === '易错').length
  const reviewCount = mastered
  const estimatedMinutes = Math.max(1, Math.ceil(reviewSize * 0.75))
  const random = useMemo(() => idioms.length ? idioms[Math.floor(Math.random() * idioms.length)] : null, [idioms])

  return <div>
    <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <div className="overflow-hidden rounded-2xl bg-indigo-950 p-5 text-white sm:rounded-3xl sm:p-10">
        <p className="text-sm font-bold tracking-[.2em] text-indigo-300">每天积累一点</p>
        <h1 className="display mt-4 text-3xl font-bold leading-tight min-[390px]:text-4xl sm:mt-5 sm:text-6xl">把容易混淆的词，<br /><span className="text-amber-300">真正分清楚。</span></h1>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-indigo-200 sm:mt-6 sm:text-base">专注行测高频易错成语。内容由后台实时更新，无需重新部署。</p>
        <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
          <Link className="btn w-full bg-white text-indigo-950 sm:w-auto" to="/idioms">开始学习 <ArrowRight size={18} /></Link>
          <Link className="btn w-full border border-indigo-700/70 text-white sm:w-auto" to="/quiz"><Shuffle size={17} />随机抽查</Link>
        </div>
      </div>
      <div className="paper flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl p-5 sm:min-h-64 sm:rounded-3xl sm:p-7">
        <div>
          <p className="text-sm font-bold text-indigo-600">{examConfig.title}</p>
          <div className="mt-5 flex min-w-0 items-end gap-2"><strong className="countdown-number text-indigo-950">{days}</strong><span className="countdown-unit shrink-0 text-slate-600">天</span></div>
        </div>
        <div className="border-t border-slate-100 pt-4 text-[15px] text-slate-500">
          <p>目标日期 · {examConfig.displayDate}</p>
          <p className="mt-1 text-xs">{examConfig.timezone} 时区</p>
        </div>
      </div>
    </section>

    {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

    <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <div className="paper rounded-2xl p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest text-amber-600">今日学习提示</p>
        <p className="display mt-3 text-lg font-bold leading-8 text-slate-800 sm:text-xl">先辨使用对象，再看常见搭配。遇到熟悉的词，也要停一秒。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [idioms.length, '成语总数', BookOpen, 'text-indigo-700'],
          [mastered, '新掌握', CheckCircle2, 'text-emerald-600'],
          [reviewCount, '可复习', Clock3, 'text-amber-600'],
          [mistakes, '易错', TriangleAlert, 'text-rose-600'],
        ].map(([value, label, Icon, color]) => <div key={String(label)} className="paper flex items-center gap-4 rounded-2xl p-4 sm:block sm:p-5">
          {typeof Icon !== 'string' && typeof Icon !== 'number' && <Icon className={String(color)} size={20} />}
          <div><strong className="block text-2xl sm:mt-4 sm:text-3xl">{String(value)}</strong><span className="text-sm text-slate-500">{String(label)}</span></div>
        </div>)}
      </div>
    </section>

    <section className="paper mt-4 rounded-2xl p-5 sm:mt-5 sm:rounded-3xl sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-emerald-600">每日复习成语</p>
          <h2 className="display mt-3 text-2xl font-bold text-indigo-950 sm:text-3xl">复习范围：已掌握成语。</h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-500">从你标记为“已掌握”的成语中生成复习组。本组 {reviewSize} 个，预计约 {estimatedMinutes} 分钟。</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <label className="block text-sm font-bold text-slate-700">每组成语数量
            <input type="number" min={1} max={50} value={reviewSize} onChange={event => setReviewSize(Math.max(1, Math.min(50, Number(event.target.value) || 1)))} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" />
          </label>
          <p className="mt-2 text-xs text-slate-400">按每个约 45 秒估算。</p>
          <Link to={`/review?count=${reviewSize}`} className="btn btn-primary mt-4 w-full">开始每日复习 <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>

    <section className="paper mt-4 rounded-2xl p-5 sm:mt-5 sm:rounded-3xl sm:p-8">
      {loading ? <p className="text-slate-500">正在读取成语…</p> : random ? <>
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-indigo-500">随机成语卡片</p>
            <h2 className="display mt-3 break-words text-2xl font-bold text-indigo-950 sm:text-3xl">{random.title}</h2>
            <Pronunciation value={random.key_pronunciations} />
          </div>
          <span className="chip status-primary hidden sm:inline-flex">{random.category}</span>
        </div>
        <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">{random.meaning}</p>
        <Link to={`/idioms/${random.id}`} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-indigo-700 sm:mt-5">查看详情 <ArrowRight size={16} /></Link>
      </> : <p className="text-slate-500">暂时没有已展示的成语。</p>}
    </section>
  </div>
}
