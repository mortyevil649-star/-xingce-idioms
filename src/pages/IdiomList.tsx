import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useIdioms } from '../hooks/useIdioms'
import { useStudy } from '../contexts/StudyContext'
import { IdiomCard } from '../components/IdiomCard'

const states=[['all','全部'],['未学','未学习'],['已掌握','已掌握'],['易错','易错'],['favorite','已收藏']] as const

export function IdiomList() {
  const { idioms,loading,error }=useIdioms()
  const {records}=useStudy()
  const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[difficulty,setDifficulty]=useState(''),[state,setState]=useState<(typeof states)[number][0]>('all')
  const categories=useMemo(()=>[...new Set(idioms.map(item=>item.category))],[idioms])
  const result=useMemo(()=>idioms.filter(idiom=>{const record=records[idiom.id];const text=`${idiom.title} ${idiom.meaning} ${idiom.tags.join(' ')}`.toLowerCase();return(!query||text.includes(query.toLowerCase()))&&(!category||idiom.category===category)&&(!difficulty||idiom.difficulty===difficulty)&&(state==='all'||state==='favorite'?state==='all'||record?.is_favorite:(record?.status??'未学')===state)}),[idioms,records,query,category,difficulty,state])
  const reset=()=>{setQuery('');setCategory('');setDifficulty('');setState('all')}
  return <div><div className="mb-7"><p className="text-sm font-bold text-indigo-600">成语库 · {idioms.length} 条</p><h1 className="display mt-2 text-4xl font-bold text-indigo-950">从用法里，把词记牢</h1></div>
    <div className="paper rounded-2xl p-4 sm:p-5"><label className="relative block"><Search className="absolute left-4 top-3.5 text-slate-400" size={19}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜索成语、释义或标签" className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none"/></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><select value={category} onChange={event=>setCategory(event.target.value)} className="focus-ring rounded-xl border border-slate-200 bg-white p-3"><option value="">全部分类</option>{categories.map(item=><option key={item}>{item}</option>)}</select><select value={difficulty} onChange={event=>setDifficulty(event.target.value)} className="focus-ring rounded-xl border border-slate-200 bg-white p-3"><option value="">全部难度</option>{['基础','进阶','高频易错'].map(item=><option key={item}>{item}</option>)}</select></div><div className="mt-4 flex flex-wrap gap-2">{states.map(([key,label])=><button key={key} onClick={()=>setState(key)} className={`focus-ring chip ${state===key?'bg-indigo-700 text-white':'bg-slate-100 text-slate-600'}`}>{label}</button>)}{(query||category||difficulty||state!=='all')&&<button onClick={reset} className="chip text-slate-500"><X size={14}/>清除筛选</button>}</div></div>
    {error&&<p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}<div className="my-5 text-sm text-slate-500">{loading?'正在读取…':<>找到 <b className="text-indigo-800">{result.length}</b> 条成语</>}</div>{!loading&&(result.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{result.map(idiom=><IdiomCard key={idiom.id} idiom={idiom}/>)}</div>:<div className="paper rounded-2xl py-20 text-center text-slate-500">没有符合条件的成语。</div>)}
  </div>
}
