import { Eye, RefreshCw, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useIdioms } from '../hooks/useIdioms'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { Pronunciation } from '../components/Pronunciation'
import type { Idiom, StudyStatus } from '../types/database'

const pick=(items:Idiom[],seen:string[])=>{const pool=items.filter(item=>!seen.includes(item.id));return pool.length?pool[Math.floor(Math.random()*pool.length)]:null}

export function Quiz(){
  const {idioms,loading}=useIdioms(),{user}=useAuth(),{saveStudy}=useStudy()
  const [item,setItem]=useState<Idiom|null>(null),[seen,setSeen]=useState<string[]>([]),[show,setShow]=useState(false),[result,setResult]=useState('')
  useEffect(()=>{if(!item&&idioms.length&&!seen.length){const first=pick(idioms,[]);setItem(first);if(first)setSeen([first.id])}else if(item&&!idioms.some(row=>row.id===item.id)){const next=pick(idioms,seen);setItem(next);if(next)setSeen(ids=>[...ids,next.id])}},[idioms,item,seen])
  const advance=()=>{const next=pick(idioms,seen);setItem(next);if(next)setSeen(ids=>[...ids,next.id]);setShow(false);setResult('')}
  const restart=()=>{const first=pick(idioms,[]);setItem(first);setSeen(first?[first.id]:[]);setShow(false);setResult('')}
  const answer=async(status:StudyStatus,message:string)=>{if(user&&item)await saveStudy(item.id,{status});setResult(user?message:'本次结果未保存，登录后可同步学习进度')}
  if(loading)return <div className="text-center text-slate-500">正在读取抽查范围…</div>
  return <div className="mx-auto w-full max-w-2xl"><div className="text-center"><p className="text-sm font-bold text-indigo-600">随机抽查</p><h1 className="display mt-2 text-3xl font-bold leading-tight text-indigo-950 sm:text-4xl">你真的记住了吗？</h1><p className="mt-3 text-[15px] leading-6 text-slate-500 sm:text-base">本轮只抽取当前已展示的成语，并且不会重复。</p></div>
    {!item?<div className="paper mt-6 rounded-2xl px-5 py-14 text-center sm:mt-8 sm:rounded-3xl sm:px-7 sm:py-20"><RotateCw className="mx-auto text-emerald-700"/><h2 className="display mt-6 break-words text-xl font-bold text-indigo-950 sm:text-2xl">{idioms.length?'这一轮成语已经全部抽完了。':'暂时没有可抽查的成语。'}</h2>{idioms.length>0&&<button onClick={restart} className="btn btn-primary mt-7 w-full sm:mt-8 sm:w-auto"><RotateCw size={17}/>重新开始一轮</button>}</div>:<div className="paper mt-6 min-h-80 min-w-0 rounded-2xl p-5 text-center sm:mt-8 sm:min-h-96 sm:rounded-3xl sm:p-12"><div className="flex flex-wrap items-center justify-between gap-2"><span className="chip bg-slate-100 text-slate-500">本轮 {seen.length} / {idioms.length}</span><button onClick={advance} className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700"><RefreshCw size={16}/>刷新成语</button></div><h2 className="display mt-7 break-words text-4xl font-bold tracking-wider text-indigo-950 sm:mt-8 sm:text-5xl sm:tracking-widest">{item.title}</h2>{show&&<div className="mt-7 min-w-0 border-t border-slate-100 pt-6 text-left sm:mt-8 sm:pt-7"><Pronunciation value={item.key_pronunciations}/><h3 className="mt-5 text-sm font-bold text-indigo-600">准确释义</h3><p className="mt-2 break-words text-[15px] leading-8 text-slate-700 sm:text-base">{item.meaning}</p></div>}{!show?<button onClick={()=>setShow(true)} className="btn btn-primary mt-9 w-full sm:mt-10 sm:w-auto"><Eye size={18}/>查看释义</button>:!result?<div className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-2"><button onClick={()=>void answer('已掌握','已记录：我掌握了')} className="btn w-full bg-emerald-100 text-emerald-700">我掌握了</button><button onClick={()=>void answer('易错','已记录：我记错了')} className="btn btn-danger w-full">我记错了</button><button onClick={()=>void answer('易错','已加入易错')} className="btn w-full bg-amber-100 text-amber-800">加入易错</button></div>:<div className="mt-7 sm:mt-8"><p className="break-words font-bold text-emerald-700">{result}</p><button onClick={advance} className="btn btn-primary mt-4 w-full sm:w-auto"><RefreshCw size={17}/>{seen.length>=idioms.length?'完成本轮':'下一条'}</button></div>}</div>}
  </div>
}
