import { ChevronDown, CirclePlus, NotebookPen, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { clearPersonalNote, emptyPersonalNote, getPersonalNote, savePersonalNote, type PersonalNote } from '../noteStore'

const makeExampleId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function PersonalNotes({ idiomId }: { idiomId: string }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<PersonalNote>(() => getPersonalNote(idiomId))
  const [message, setMessage] = useState('')
  const updateExample = (id: string, text: string) => setDraft(current => ({ ...current, examples: current.examples.map(example => example.id === id ? { ...example, text } : example) }))
  const removeExample = (id: string) => setDraft(current => ({ ...current, examples: current.examples.filter(example => example.id !== id) }))
  const save = () => { savePersonalNote(idiomId, draft); setDraft(getPersonalNote(idiomId)); setMessage('已保存') }
  const clear = () => { clearPersonalNote(idiomId); setDraft(emptyPersonalNote()); setMessage('已清空') }

  return <section className="paper mt-8 overflow-hidden rounded-3xl">
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="focus-ring flex w-full items-center justify-between gap-4 p-6 text-left sm:p-8">
      <span className="flex items-center gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><NotebookPen size={20}/></span><span><strong className="block text-lg text-indigo-950">我的笔记</strong><small className="mt-1 block font-normal text-slate-500">记录自己的理解、易错点和例句</small></span></span>
      <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} size={20}/>
    </button>
    {open && <div className="border-t border-slate-100 p-6 sm:p-8">
      <label className="block text-sm font-bold text-slate-700">我的备注<textarea value={draft.remark} onChange={event => { setDraft({...draft, remark:event.target.value}); setMessage('') }} rows={5} placeholder="记录自己的理解、老师笔记或需要反复提醒的内容……" className="focus-ring mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal leading-7 outline-none"/></label>
      <div className="mt-6"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-700">我的例句</h3><button type="button" onClick={() => setDraft({...draft, examples:[...draft.examples,{id:makeExampleId(),text:''}]})} className="focus-ring inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><CirclePlus size={16}/>添加例句</button></div>
        <div className="mt-3 space-y-3">{draft.examples.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">还没有自写例句</p>}{draft.examples.map((example,index) => <div key={example.id} className="flex items-start gap-2"><span className="mt-3 text-xs font-bold text-slate-400">{index+1}</span><textarea aria-label={`我的例句 ${index+1}`} value={example.text} onChange={event => { updateExample(example.id,event.target.value); setMessage('') }} rows={2} placeholder="写下自己的例句" className="focus-ring min-w-0 flex-1 resize-y rounded-xl border border-slate-200 p-3 leading-6 outline-none"/><button type="button" aria-label={`删除例句 ${index+1}`} onClick={() => { removeExample(example.id); setMessage('') }} className="focus-ring mt-1 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={17}/></button></div>)}</div>
      </div>
      <label className="mt-6 block text-sm font-bold text-slate-700">我的易错提醒<input value={draft.mistakeReminder} onChange={event => { setDraft({...draft, mistakeReminder:event.target.value}); setMessage('') }} placeholder="例如：不要误解为……" className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal outline-none"/></label>
      <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><button type="button" onClick={save} className="btn btn-primary"><Save size={17}/>保存笔记</button><button type="button" onClick={clear} className="btn text-rose-600 hover:bg-rose-50"><Trash2 size={17}/>清空本条个人笔记</button>{message && <span className="text-center text-sm font-bold text-emerald-700 sm:ml-auto">{message}</span>}</div>
    </div>}
  </section>
}
