import { ChevronDown, CirclePlus, LogIn, NotebookPen, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'

interface DraftExample { id: string; content: string; sort_order: number }
const tempId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function PersonalNotes({ idiomId }: { idiomId: string }) {
  const { user } = useAuth()
  const { records, examples, saveStudy, saveExamples } = useStudy()
  const record = records[idiomId]
  const [open,setOpen] = useState(false)
  const [note,setNote] = useState('')
  const [reminder,setReminder] = useState('')
  const [draftExamples,setDraftExamples] = useState<DraftExample[]>([])
  const [message,setMessage] = useState('')
  useEffect(() => { setNote(record?.personal_note ?? ''); setReminder(record?.personal_mistake_reminder ?? ''); setDraftExamples((examples[idiomId] ?? []).map(item => ({id:item.id,content:item.content,sort_order:item.sort_order}))) }, [record, examples, idiomId])

  const save = async () => {
    try {
      await saveStudy(idiomId,{personal_note:note,personal_mistake_reminder:reminder})
      await saveExamples(idiomId,draftExamples.map((item,index)=>({...item,sort_order:index})))
      setMessage('已保存并同步')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
  }
  const clear = async () => { setNote('');setReminder('');setDraftExamples([]);await saveStudy(idiomId,{personal_note:'',personal_mistake_reminder:''});await saveExamples(idiomId,[]);setMessage('已清空') }

  return <section className="paper mt-8 overflow-hidden rounded-3xl"><button type="button" aria-expanded={open} onClick={()=>setOpen(value=>!value)} className="focus-ring flex w-full items-center justify-between gap-4 p-6 text-left sm:p-8"><span className="flex items-center gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><NotebookPen size={20}/></span><span><strong className="block text-lg text-indigo-950">我的笔记</strong><small className="mt-1 block font-normal text-slate-500">登录后在手机和电脑之间同步</small></span></span><ChevronDown className={`shrink-0 text-slate-400 transition-transform ${open?'rotate-180':''}`} size={20}/></button>
    {open && (!user ? <div className="border-t border-slate-100 p-8 text-center"><LogIn className="mx-auto text-slate-400"/><p className="mt-3 text-sm text-slate-500">登录后才能保存个人学习内容。</p><Link to="/admin/login" className="btn btn-primary mt-4">管理员登录</Link></div> : <div className="border-t border-slate-100 p-6 sm:p-8">
      <label className="block text-sm font-bold text-slate-700">我的备注<textarea value={note} onChange={event=>{setNote(event.target.value);setMessage('')}} rows={5} className="focus-ring mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal leading-7 outline-none"/></label>
      <div className="mt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-700">我的例句</h3><button onClick={()=>setDraftExamples([...draftExamples,{id:tempId(),content:'',sort_order:draftExamples.length}])} className="focus-ring inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-indigo-700"><CirclePlus size={16}/>添加例句</button></div><div className="mt-3 space-y-3">{!draftExamples.length&&<p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">还没有自写例句</p>}{draftExamples.map((item,index)=><div key={item.id} className="flex items-start gap-2"><span className="mt-3 text-xs text-slate-400">{index+1}</span><textarea value={item.content} onChange={event=>setDraftExamples(draftExamples.map(old=>old.id===item.id?{...old,content:event.target.value}:old))} rows={2} className="focus-ring min-w-0 flex-1 rounded-xl border border-slate-200 p-3"/><button aria-label={`删除例句 ${index+1}`} onClick={()=>setDraftExamples(draftExamples.filter(old=>old.id!==item.id))} className="focus-ring rounded-lg p-2 text-slate-400 hover:text-rose-600"><Trash2 size={17}/></button></div>)}</div></div>
      <label className="mt-6 block text-sm font-bold text-slate-700">我的易错提醒<input value={reminder} onChange={event=>{setReminder(event.target.value);setMessage('')}} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal"/></label>
      <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><button onClick={()=>void save()} className="btn btn-primary"><Save size={17}/>保存笔记</button><button onClick={()=>void clear()} className="btn text-rose-600 hover:bg-rose-50"><Trash2 size={17}/>清空本条个人笔记</button>{message&&<span className="text-sm font-bold text-emerald-700 sm:ml-auto">{message}</span>}</div>
    </div>)}
  </section>
}
