import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { useIdioms } from '../hooks/useIdioms'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { Pronunciation } from '../components/Pronunciation'
import { PersonalNotes } from '../components/PersonalNotes'
import { LoginRequiredLink } from '../components/LoginRequiredLink'
import { useIdiomRelations } from '../hooks/useIdiomRelations'
import type { Idiom, IdiomRelation, IdiomRelationTerm, IdiomRelationType, StudyStatus } from '../types/database'

const statuses: StudyStatus[] = ['未学', '已掌握', '易错']

export function IdiomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { idioms, loading, error } = useIdioms()
  const { relations } = useIdiomRelations()
  const { records, saveStudy } = useStudy()
  const idiom = idioms.find(item => item.id === id)

  useEffect(() => window.scrollTo(0, 0), [id])

  if (loading) return <div className="paper rounded-2xl p-6 text-center text-slate-500 sm:p-10">正在读取成语…</div>
  if (!idiom) return <div className="paper rounded-2xl p-6 text-center sm:p-10">{error || '该成语不存在或未公开。'}<br /><Link className="mt-4 inline-flex min-h-11 items-center text-indigo-700" to="/idioms">返回成语库</Link></div>

  const index = idioms.findIndex(item => item.id === idiom.id)
  const previous = idioms[index - 1]
  const next = idioms[index + 1]
  const relatedItems = relations
    .filter(relation => relation.source_id === idiom.id || relation.target_id === idiom.id)
    .map(relation => ({
      relation,
      target: relation.target_term_id
        ? relation.target_term
        : idioms.find(item => item.id === (relation.source_id === idiom.id ? relation.target_id : relation.source_id)),
      isTerm: Boolean(relation.target_term_id)
    }))
    .filter((item): item is { relation: IdiomRelation; target: Idiom | IdiomRelationTerm; isTerm: boolean } => Boolean(item.target))
  const record = records[idiom.id]
  const update = async (patch: Parameters<typeof saveStudy>[1]) => {
    if (user) await saveStudy(idiom.id, patch)
  }
  const setStatus = async (status: StudyStatus) => {
    await update({ status })
    if (status === '已掌握' && next) navigate(`/idioms/${next.id}`)
  }

  return <div className="min-w-0">
    <Link to="/idioms" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-slate-500 sm:mb-5"><ArrowLeft size={16} />返回成语库</Link>
    <article className="paper min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl">
      <header className="border-b border-indigo-100 bg-indigo-50/70 p-5 sm:p-9">
        <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="chip bg-indigo-700 text-white">{idiom.category}</span>
              <span className="chip status-idle">{idiom.difficulty}</span>
            </div>
            <h1 className="display mt-4 break-words text-3xl font-bold leading-tight text-indigo-950 sm:text-5xl">{idiom.title}</h1>
            <Pronunciation value={idiom.key_pronunciations} note={idiom.pronunciation_note} detail />
          </div>
          {user ? <button
            aria-label={record?.is_favorite ? '取消收藏' : '收藏'}
            onClick={() => void update({ is_favorite: !record?.is_favorite })}
            className={`focus-ring flex size-11 shrink-0 items-center justify-center rounded-full border ${record?.is_favorite ? 'status-favorite' : 'status-idle'}`}
          >
            <Bookmark size={20} fill={record?.is_favorite ? 'currentColor' : 'none'} />
          </button> : null}
        </div>
      </header>
      <div className="grid min-w-0 gap-7 p-5 sm:gap-8 sm:p-9 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-7">
          <Section title="准确释义"><p>{idiom.meaning}</p></Section>
          {idiom.common_mistake && <Section title="常见误用" danger><p>{idiom.common_mistake}</p></Section>}
          <section className="min-w-0 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
            <h2 className="section-title mb-4">标准知识区</h2>
            <dl className="space-y-4 text-[15px] leading-7 sm:text-base">
              <Info title="适用对象" value={idiom.applicable_objects} />
              <div>
                <dt className="font-bold text-slate-700">常见搭配</dt>
                <dd className="mt-2 flex min-w-0 flex-wrap gap-2">{idiom.common_collocations.length ? idiom.common_collocations.map(item => <span key={item} className="chip status-idle">{item}</span>) : '待人工核对'}</dd>
              </div>
              <Info title="不适用对象或使用限制" value={idiom.usage_restrictions} />
            </dl>
          </section>
          <Section title="标准例句">{idiom.idiom_examples?.length ? <ol className="space-y-3">{idiom.idiom_examples.map((example, exampleIndex) => <li key={example.id} className="break-words border-l-4 border-emerald-400 pl-3 sm:pl-4"><span className="mr-2 text-xs text-slate-400">{exampleIndex + 1}</span>{example.content}</li>)}</ol> : <p className="text-slate-400">待人工核对</p>}</Section>
          <Section title="来源或备注"><p>{idiom.source || '待人工核对'}</p></Section>
          <div className="flex min-w-0 flex-wrap gap-2">{idiom.tags.map(tag => <span className="chip status-idle" key={tag}>#{tag}</span>)}</div>
        </div>
        <aside className="min-w-0">
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 lg:sticky lg:top-24">
            <h2 className="font-bold text-slate-800">我的学习记录</h2>
            {!user ? <div className="mt-4">
              <p className="mb-4 text-sm leading-6 text-slate-500">登录后可以同步收藏、学习状态、笔记、例句和复习日期。</p>
              <LoginRequiredLink className="w-full" />
            </div> : <>
              <div className="mt-4 grid gap-2">{statuses.map(status => <button
                onClick={() => void setStatus(status)}
                key={status}
                className={`focus-ring flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold ${record?.status === status ? (status === '易错' ? 'status-mistake' : status === '已掌握' ? 'status-mastered' : 'status-primary') : 'status-idle'}`}
              >
                {status === '易错' ? <TriangleAlert size={16} /> : <Check size={16} />} {status}
              </button>)}</div>
              <label className="mt-6 block text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2"><CalendarDays size={16} />下次复习日期</span>
                <input type="date" value={record?.next_review || ''} onChange={event => void update({ next_review: event.target.value || null })} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 p-2.5 font-normal" />
              </label>
            </>}
          </div>
        </aside>
      </div>
    </article>
    <IdiomRelationGraph currentTitle={idiom.title} items={relatedItems} />
    <nav aria-label="成语顺序导航" className="mt-4 grid min-w-0 gap-3 sm:mt-5 sm:grid-cols-2">
      {previous && <Link to={`/idioms/${previous.id}`} className="paper paper-hover flex min-h-20 min-w-0 items-center gap-3 rounded-2xl p-4"><ArrowLeft className="shrink-0 text-indigo-600" /><span className="min-w-0"><small className="block text-xs text-slate-400">上一个成语</small><strong className="display mt-1 block break-words text-lg text-indigo-950">{previous.title}</strong></span></Link>}
      {next && <Link to={`/idioms/${next.id}`} className="paper paper-hover flex min-h-20 min-w-0 items-center justify-between gap-3 rounded-2xl p-4 text-right sm:col-start-2"><span className="ml-auto min-w-0"><small className="block text-xs text-slate-400">下一个成语</small><strong className="display mt-1 block break-words text-lg text-indigo-950">{next.title}</strong></span><ArrowRight className="shrink-0 text-indigo-600" /></Link>}
    </nav>
    <PersonalNotes key={idiom.id} idiomId={idiom.id} />
  </div>
}

const relationTypeLabels: Record<IdiomRelationType, string> = {
  confusion: '易混词',
  synonym: '近义词',
  antonym: '反义词',
  related: '关联辨析'
}

const relationTypeStyles: Record<IdiomRelationType, string> = {
  confusion: 'status-review',
  synonym: 'status-mastered',
  antonym: 'status-mistake',
  related: 'status-primary'
}

function IdiomRelationGraph({ currentTitle, items }: { currentTitle: string; items: { relation: IdiomRelation; target: Idiom | IdiomRelationTerm; isTerm: boolean }[] }) {
  if (!items.length) return null
  const grouped = (Object.keys(relationTypeLabels) as IdiomRelationType[])
    .map(type => ({
      type,
      items: items
        .filter(item => item.relation.relation_type === type)
        .sort((a, b) => a.relation.sort_order - b.relation.sort_order)
    }))
    .filter(group => group.items.length)

  return <section className="paper mt-5 min-w-0 overflow-hidden rounded-2xl p-5 sm:mt-6 sm:p-7">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold tracking-widest text-indigo-600">成语关系</p>
        <h2 className="display mt-1 break-words text-2xl font-bold text-indigo-950 sm:text-3xl">{currentTitle}</h2>
      </div>
      <p className="text-sm leading-6 text-slate-500">展示已审核发布的易混、近义、反义和关联辨析。</p>
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="hidden rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 text-center lg:flex lg:min-h-full lg:items-center lg:justify-center">
        <div>
          <span className="chip status-primary">中心成语</span>
          <strong className="display mt-3 block text-2xl text-indigo-950">{currentTitle}</strong>
        </div>
      </div>
      <div className="min-w-0 space-y-5">
        {grouped.map(group => <div key={group.type} className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span className={`chip ${relationTypeStyles[group.type]}`}>{relationTypeLabels[group.type]}</span>
            <span className="hidden h-px flex-1 bg-indigo-100 sm:block" />
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {group.items.map(({ relation, target, isTerm }) => isTerm ? <div
              key={relation.id}
              className="paper flex min-h-24 min-w-0 items-center justify-between gap-3 rounded-2xl p-4"
            >
              <span className="min-w-0">
                <span className="chip status-idle">关系词库</span>
                <strong className="display mt-2 block break-words text-xl text-indigo-950">{target.title}</strong>
                <span className="mt-2 block break-words text-sm leading-6 text-slate-600">{relation.comparison_note}</span>
              </span>
            </div> : <Link
              key={relation.id}
              to={`/idioms/${target.id}`}
              className="paper paper-hover group flex min-h-24 min-w-0 items-center justify-between gap-3 rounded-2xl p-4"
            >
              <span className="min-w-0">
                <strong className="display block break-words text-xl text-indigo-950">{target.title}</strong>
                <span className="mt-2 block break-words text-sm leading-6 text-slate-600">{relation.comparison_note}</span>
              </span>
              <ArrowRight className="shrink-0 text-indigo-600 transition group-hover:translate-x-0.5" size={18} />
            </Link>)}
          </div>
        </div>)}
      </div>
    </div>
  </section>
}

function Section({ title, children, danger = false }: { title: string; children: ReactNode; danger?: boolean }) {
  return <section className="min-w-0"><h2 className={`mb-3 text-sm font-bold tracking-widest ${danger ? 'text-rose-600' : 'text-indigo-600'}`}>{title}</h2><div className={`break-words text-[15px] leading-8 sm:text-base ${title.includes('来源') ? 'meta-text' : 'text-slate-700'}`}>{children}</div></section>
}

function Info({ title, value }: { title: string; value: string | null }) {
  return <div className="min-w-0"><dt className="font-bold text-slate-700">{title}</dt><dd className="mt-1 break-words text-slate-600">{value || '待人工核对'}</dd></div>
}
