import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { idioms, type IdiomStatus } from '../data/idioms'
import { idiomKnowledge } from '../data/idiomKnowledge'
import { getRecord, saveRecord } from '../store'
import { Pronunciation } from '../components/Pronunciation'
import { PersonalNotes } from '../components/PersonalNotes'

const statusOptions: [IdiomStatus, string][] = [['unlearned','未学'],['mastered','已掌握'],['mistake','易错']]

export function IdiomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const idiom = idioms.find(item => item.id === id)
  const [, setVersion] = useState(0)
  useEffect(() => { window.scrollTo(0, 0) }, [id])
  if (!idiom) return <div>未找到该成语。<Link to="/idioms">返回成语库</Link></div>
  const record = getRecord(idiom)
  const knowledge = idiomKnowledge[idiom.id]
  const currentIndex = idioms.findIndex(item => item.id === idiom.id)
  const previousIdiom = currentIndex > 0 ? idioms[currentIndex - 1] : undefined
  const nextIdiom = currentIndex < idioms.length - 1 ? idioms[currentIndex + 1] : undefined
  const update = (patch: Parameters<typeof saveRecord>[1]) => { saveRecord(idiom.id, patch); setVersion(value => value + 1) }
  const setLearningStatus = (status: IdiomStatus) => {
    update({ status })
    if (status === 'mastered' && nextIdiom) navigate(`/idioms/${nextIdiom.id}`)
  }
  const related = idioms.filter(item => item.category === idiom.category && item.id !== idiom.id).slice(0, 3)

  return <div>
    <Link to="/idioms" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-indigo-700"><ArrowLeft size={16}/>返回成语库</Link>
    <article className="paper overflow-hidden rounded-3xl">
      <header className="border-b border-indigo-100 bg-indigo-50/70 p-6 sm:p-9"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="chip bg-indigo-700 text-white">{idiom.category}</span><span className="chip bg-white text-slate-600">{idiom.difficulty}</span></div><h1 className="display mt-4 text-4xl font-bold text-indigo-950 sm:text-5xl">{idiom.title}</h1><Pronunciation items={idiom.keyPronunciations} detail/></div><button aria-label={record.isFavorite ? '取消收藏' : '收藏'} onClick={() => update({isFavorite:!record.isFavorite})} className={`focus-ring rounded-full p-3 ${record.isFavorite?'bg-amber-100 text-amber-600':'bg-white text-slate-400'}`}><Bookmark fill={record.isFavorite?'currentColor':'none'}/></button></div></header>
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_280px]"><div className="space-y-7">
        <Section title="准确释义"><p>{idiom.meaning}</p></Section>
        {knowledge && <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5"><h2 className="mb-4 text-sm font-bold tracking-widest text-indigo-700">标准知识区</h2><dl className="space-y-4 text-sm leading-7"><div><dt className="font-bold text-slate-700">适用对象</dt><dd className="mt-1 text-slate-600">{knowledge.applicableTo}</dd></div><div><dt className="font-bold text-slate-700">常见搭配</dt><dd className="mt-2 flex flex-wrap gap-2">{knowledge.collocations.map(item => <span key={item} className="rounded-lg bg-white px-3 py-1.5 text-slate-600 shadow-sm">{item}</span>)}</dd></div><div><dt className="font-bold text-slate-700">不适用对象或使用限制</dt><dd className="mt-1 text-slate-600">{knowledge.restrictions}</dd></div></dl></section>}
        <Section title="正确例句"><p className="border-l-4 border-emerald-400 pl-4">{idiom.example}</p></Section><Section title="辨析与备注"><p>{idiom.notes}</p><p className="mt-3 text-sm text-slate-500">来源或备注：{idiom.source}</p></Section><div className="flex flex-wrap gap-2">{idiom.tags.map(tag => <span className="chip bg-slate-100 text-slate-600" key={tag}>#{tag}</span>)}</div>
      </div><aside><div className="sticky top-24 rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-800">我的学习记录</h2><div className="mt-4 grid gap-2">{statusOptions.map(([key,label]) => <button onClick={() => setLearningStatus(key)} key={key} className={`focus-ring flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${record.status===key ? key==='mistake'?'bg-rose-100 text-rose-700':'bg-indigo-100 text-indigo-700':'bg-slate-50 text-slate-500'}`}>{key==='mistake'?<TriangleAlert size={16}/>:<Check size={16}/>} {label}</button>)}</div><label className="mt-6 block text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><CalendarDays size={16}/>下次复习日期</span><input type="date" value={record.nextReview} onChange={event => update({nextReview:event.target.value})} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 p-2.5 font-normal"/></label></div></aside></div>
    </article>
    <nav aria-label="成语顺序导航" className="mt-5 grid gap-3 sm:grid-cols-2">
      {previousIdiom ? <Link to={`/idioms/${previousIdiom.id}`} className="paper paper-hover focus-ring flex min-h-20 items-center gap-3 rounded-2xl p-4"><ArrowLeft className="shrink-0 text-indigo-600" size={19}/><span><small className="block text-xs text-slate-400">上一个成语</small><strong className="display mt-1 block text-lg text-indigo-950">{previousIdiom.title}</strong></span></Link> : <div className="hidden sm:block"/>}
      {nextIdiom ? <Link to={`/idioms/${nextIdiom.id}`} className="paper paper-hover focus-ring flex min-h-20 items-center justify-between gap-3 rounded-2xl p-4 text-right sm:col-start-2"><span className="ml-auto"><small className="block text-xs text-slate-400">下一个成语</small><strong className="display mt-1 block text-lg text-indigo-950">{nextIdiom.title}</strong></span><ArrowRight className="shrink-0 text-indigo-600" size={19}/></Link> : null}
    </nav>
    <PersonalNotes key={idiom.id} idiomId={idiom.id}/>
    <section className="mt-8"><h2 className="display text-2xl font-bold text-indigo-950">同类别推荐</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{related.map(item => <Link to={`/idioms/${item.id}`} key={item.id} className="paper paper-hover rounded-2xl p-5"><strong className="display text-xl text-indigo-950">{item.title}</strong><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.meaning}</p></Link>)}</div></section>
  </div>
}

function Section({title,children,danger=false}:{title:string;children:React.ReactNode;danger?:boolean}) { return <section><h2 className={`mb-3 text-sm font-bold tracking-widest ${danger?'text-rose-600':'text-indigo-600'}`}>{title}</h2><div className="leading-8 text-slate-700">{children}</div></section> }
