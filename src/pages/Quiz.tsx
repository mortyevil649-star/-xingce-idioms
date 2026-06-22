import { Eye, RefreshCw, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { idioms, type Idiom } from '../data/idioms'
import { saveRecord } from '../store'
import { Pronunciation } from '../components/Pronunciation'

const pickUnseen = (seenIds: string[]): Idiom | null => {
  const pool = idioms.filter(idiom => !seenIds.includes(idiom.id))
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}

export function Quiz() {
  const [item, setItem] = useState<Idiom | null>(() => pickUnseen([]))
  const [seenIds, setSeenIds] = useState<string[]>(() => item ? [item.id] : [])
  const [show, setShow] = useState(false)
  const [result, setResult] = useState('')

  const advance = () => {
    const next = pickUnseen(seenIds)
    if (!next) {
      setItem(null)
    } else {
      setItem(next)
      setSeenIds(current => [...current, next.id])
    }
    setShow(false)
    setResult('')
  }

  const restart = () => {
    const first = pickUnseen([])
    setItem(first)
    setSeenIds(first ? [first.id] : [])
    setShow(false)
    setResult('')
  }

  const answer = (status: 'mastered' | 'mistake', message: string) => {
    if (!item) return
    saveRecord(item.id, { status })
    setResult(message)
  }

  return <div className="mx-auto max-w-2xl">
    <div className="text-center"><p className="text-sm font-bold text-indigo-600">随机抽查</p><h1 className="display mt-2 text-4xl font-bold text-indigo-950">你真的记住了吗？</h1><p className="mt-3 text-slate-500">先在心里说出释义，再揭晓答案。本轮不会重复出现。</p></div>
    {!item ? <div className="paper mt-8 rounded-3xl px-7 py-20 text-center sm:px-12"><div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><RotateCw size={24}/></div><h2 className="display mt-6 text-2xl font-bold text-indigo-950">这一轮成语已经全部抽完了。</h2><p className="mt-3 text-sm text-slate-500">本轮共抽查 {seenIds.length} 条成语</p><button type="button" onClick={restart} className="btn btn-primary mt-8"><RotateCw size={17}/>重新开始一轮</button></div>
    : <div className="paper mt-8 min-h-96 rounded-3xl p-7 text-center sm:p-12">
      <div className="flex items-center justify-between gap-3"><span className="chip bg-slate-100 text-slate-500">本轮 {seenIds.length} / {idioms.length}</span><button type="button" onClick={advance} className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><RefreshCw size={16}/>刷新成语</button></div>
      <h2 className="display mt-8 text-5xl font-bold tracking-widest text-indigo-950">{item.title}</h2>
      {show && <div className="mt-8 border-t border-slate-100 pt-7 text-left"><Pronunciation items={item.keyPronunciations}/><h3 className="mt-5 text-sm font-bold text-indigo-600">准确释义</h3><p className="mt-2 leading-8 text-slate-700">{item.meaning}</p></div>}
      {!show ? <button type="button" onClick={() => setShow(true)} className="btn btn-primary mt-10"><Eye size={18}/>查看释义</button>
      : !result ? <div className="mt-8 grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => answer('mastered','已记录：我掌握了')} className="btn bg-emerald-100 text-emerald-700">我掌握了</button><button type="button" onClick={() => answer('mistake','已记录：我记错了')} className="btn btn-danger">我记错了</button><button type="button" onClick={() => answer('mistake','已加入易错')} className="btn bg-amber-100 text-amber-800">加入易错</button></div>
      : <div className="mt-8"><p className="font-bold text-emerald-700">{result}</p><button type="button" onClick={advance} className="btn btn-primary mt-4"><RefreshCw size={17}/>{seenIds.length === idioms.length ? '完成本轮' : '下一条'}</button></div>}
    </div>}
  </div>
}
