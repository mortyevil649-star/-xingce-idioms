import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, TriangleAlert } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useIdioms } from '../hooks/useIdioms'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { Pronunciation } from '../components/Pronunciation'
import { PersonalNotes } from '../components/PersonalNotes'
import type { StudyStatus } from '../types/database'

const statuses:StudyStatus[]=['未学','已掌握','易错']

export function IdiomDetail() {
  const {id}=useParams(),navigate=useNavigate()
  const {user}=useAuth()
  const {idioms,loading,error}=useIdioms()
  const {records,saveStudy}=useStudy()
  const idiom=idioms.find(item=>item.id===id)
  useEffect(()=>window.scrollTo(0,0),[id])
  if(loading)return <div className="paper rounded-2xl p-10 text-center text-slate-500">正在读取成语…</div>
  if(!idiom)return <div className="paper rounded-2xl p-10 text-center">{error||'该成语不存在或未公开。'}<br/><Link className="mt-4 inline-block text-indigo-700" to="/idioms">返回成语库</Link></div>
  const index=idioms.findIndex(item=>item.id===idiom.id),previous=idioms[index-1],next=idioms[index+1],record=records[idiom.id]
  const update=async(patch:Parameters<typeof saveStudy>[1])=>{if(user)await saveStudy(idiom.id,patch)}
  const setStatus=async(status:StudyStatus)=>{await update({status});if(status==='已掌握'&&next)navigate(`/idioms/${next.id}`)}
  return <div><Link to="/idioms" className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-slate-500"><ArrowLeft size={16}/>返回成语库</Link><article className="paper overflow-hidden rounded-3xl"><header className="border-b border-indigo-100 bg-indigo-50/70 p-6 sm:p-9"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="chip bg-indigo-700 text-white">{idiom.category}</span><span className="chip bg-white text-slate-600">{idiom.difficulty}</span></div><h1 className="display mt-4 text-4xl font-bold text-indigo-950 sm:text-5xl">{idiom.title}</h1><Pronunciation value={idiom.key_pronunciations} note={idiom.pronunciation_note} detail/></div><button disabled={!user} aria-label={record?.is_favorite?'取消收藏':'收藏'} onClick={()=>void update({is_favorite:!record?.is_favorite})} className={`focus-ring rounded-full p-3 disabled:opacity-40 ${record?.is_favorite?'bg-amber-100 text-amber-600':'bg-white text-slate-400'}`}><Bookmark fill={record?.is_favorite?'currentColor':'none'}/></button></div></header>
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_280px]"><div className="space-y-7"><Section title="准确释义"><p>{idiom.meaning}</p></Section>{idiom.common_mistake&&<Section title="常见误用" danger><p>{idiom.common_mistake}</p></Section>}<section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5"><h2 className="mb-4 text-sm font-bold tracking-widest text-indigo-700">标准知识区</h2><dl className="space-y-4 text-sm leading-7"><Info title="适用对象" value={idiom.applicable_objects}/><div><dt className="font-bold text-slate-700">常见搭配</dt><dd className="mt-2 flex flex-wrap gap-2">{idiom.common_collocations.length?idiom.common_collocations.map(item=><span key={item} className="rounded-lg bg-white px-3 py-1.5 text-slate-600 shadow-sm">{item}</span>):'待人工核对'}</dd></div><Info title="不适用对象或使用限制" value={idiom.usage_restrictions}/></dl></section><Section title="标准例句">{idiom.idiom_examples?.length?<ol className="space-y-3">{idiom.idiom_examples.map((example,index)=><li key={example.id} className="border-l-4 border-emerald-400 pl-4"><span className="mr-2 text-xs text-slate-400">{index+1}</span>{example.content}</li>)}</ol>:<p className="text-slate-400">待人工核对</p>}</Section><Section title="来源或备注"><p>{idiom.source||'待人工核对'}</p></Section><div className="flex flex-wrap gap-2">{idiom.tags.map(tag=><span className="chip bg-slate-100 text-slate-600" key={tag}>#{tag}</span>)}</div></div>
        <aside><div className="sticky top-24 rounded-2xl border border-slate-200 p-5"><h2 className="font-bold text-slate-800">我的学习记录</h2>{!user&&<p className="mt-2 text-xs leading-5 text-slate-400">登录后可同步学习状态。</p>}<div className="mt-4 grid gap-2">{statuses.map(status=><button disabled={!user} onClick={()=>void setStatus(status)} key={status} className={`focus-ring flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold disabled:opacity-40 ${record?.status===status?(status==='易错'?'bg-rose-100 text-rose-700':'bg-indigo-100 text-indigo-700'):'bg-slate-50 text-slate-500'}`}>{status==='易错'?<TriangleAlert size={16}/>:<Check size={16}/>} {status}</button>)}</div><label className="mt-6 block text-sm font-bold text-slate-700"><span className="flex items-center gap-2"><CalendarDays size={16}/>下次复习日期</span><input disabled={!user} type="date" value={record?.next_review||''} onChange={event=>void update({next_review:event.target.value||null})} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 p-2.5 font-normal disabled:opacity-40"/></label></div></aside>
      </div></article>
    <nav aria-label="成语顺序导航" className="mt-5 grid gap-3 sm:grid-cols-2">{previous?<Link to={`/idioms/${previous.id}`} className="paper paper-hover flex min-h-20 items-center gap-3 rounded-2xl p-4"><ArrowLeft className="text-indigo-600"/><span><small className="block text-xs text-slate-400">上一个成语</small><strong className="display mt-1 block text-lg text-indigo-950">{previous.title}</strong></span></Link>:<div/>}{next&&<Link to={`/idioms/${next.id}`} className="paper paper-hover flex min-h-20 items-center justify-between gap-3 rounded-2xl p-4 text-right sm:col-start-2"><span className="ml-auto"><small className="block text-xs text-slate-400">下一个成语</small><strong className="display mt-1 block text-lg text-indigo-950">{next.title}</strong></span><ArrowRight className="text-indigo-600"/></Link>}</nav>
    <PersonalNotes key={idiom.id} idiomId={idiom.id}/>
  </div>
}

function Section({title,children,danger=false}:{title:string;children:React.ReactNode;danger?:boolean}){return <section><h2 className={`mb-3 text-sm font-bold tracking-widest ${danger?'text-rose-600':'text-indigo-600'}`}>{title}</h2><div className="leading-8 text-slate-700">{children}</div></section>}
function Info({title,value}:{title:string;value:string|null}){return <div><dt className="font-bold text-slate-700">{title}</dt><dd className="mt-1 text-slate-600">{value||'待人工核对'}</dd></div>}
