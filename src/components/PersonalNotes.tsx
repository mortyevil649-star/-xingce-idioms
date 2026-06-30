import { CirclePlus, NotebookPen, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStudy } from '../contexts/StudyContext'
import { ConfirmDialog } from './ConfirmDialog'
import { LoginRequiredLink } from './LoginRequiredLink'

interface DraftExample {
  id: string
  content: string
  sort_order: number
}

const tempId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2)}`

const text = {
  addExample: '\u6dfb\u52a0\u4f8b\u53e5',
  cancelClear: '\u518d\u60f3\u60f3',
  clear: '\u6e05\u7a7a\u672c\u6761\u4e2a\u4eba\u7b14\u8bb0',
  clearDone: '\u5df2\u6e05\u7a7a',
  clearMessage: '\u6e05\u7a7a\u540e\uff0c\u672c\u6210\u8bed\u7684\u6211\u7684\u5907\u6ce8\u3001\u6211\u7684\u4f8b\u53e5\u548c\u6211\u7684\u6613\u9519\u63d0\u9192\u90fd\u4f1a\u88ab\u5220\u9664\u3002\u8fd9\u4e2a\u64cd\u4f5c\u4e0d\u4f1a\u5f71\u54cd\u5176\u4ed6\u6210\u8bed\u3002',
  clearTitle: '\u786e\u8ba4\u6e05\u7a7a\u672c\u6761\u4e2a\u4eba\u7b14\u8bb0\uff1f',
  confirmClear: '\u786e\u8ba4\u6e05\u7a7a',
  deleteExample: '\u5220\u9664\u4f8b\u53e5',
  emptyExamples: '\u8fd8\u6ca1\u6709\u81ea\u5199\u4f8b\u53e5',
  loginHint: '\u767b\u5f55\u540e\u624d\u80fd\u4fdd\u5b58\u4e2a\u4eba\u5907\u6ce8\u3001\u6211\u7684\u4f8b\u53e5\u548c\u6613\u9519\u63d0\u9192\u3002',
  myExamples: '\u6211\u7684\u4f8b\u53e5',
  myMistakeReminder: '\u6211\u7684\u6613\u9519\u63d0\u9192',
  myNote: '\u6211\u7684\u5907\u6ce8',
  myNotes: '\u6211\u7684\u7b14\u8bb0',
  save: '\u4fdd\u5b58\u7b14\u8bb0',
  saveDone: '\u5df2\u4fdd\u5b58\u5e76\u540c\u6b65',
  saveFailed: '\u4fdd\u5b58\u5931\u8d25',
  syncHint: '\u767b\u5f55\u540e\u5728\u624b\u673a\u548c\u7535\u8111\u4e4b\u95f4\u540c\u6b65',
}

export function PersonalNotes({ idiomId }: { idiomId: string }) {
  const { user } = useAuth()
  const { records, examples, saveStudy, saveExamples } = useStudy()
  const record = records[idiomId]
  const [note, setNote] = useState('')
  const [reminder, setReminder] = useState('')
  const [draftExamples, setDraftExamples] = useState<DraftExample[]>([])
  const [message, setMessage] = useState('')
  const [confirmingClear, setConfirmingClear] = useState(false)

  useEffect(() => {
    setNote(record?.personal_note ?? '')
    setReminder(record?.personal_mistake_reminder ?? '')
    setDraftExamples((examples[idiomId] ?? []).map(item => ({
      id: item.id,
      content: item.content,
      sort_order: item.sort_order,
    })))
  }, [record, examples, idiomId])

  const save = async () => {
    try {
      await saveStudy(idiomId, {
        personal_note: note,
        personal_mistake_reminder: reminder,
      })
      await saveExamples(idiomId, draftExamples.map((item, index) => ({
        ...item,
        sort_order: index,
      })))
      setMessage(text.saveDone)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.saveFailed)
    }
  }

  const clear = async () => {
    setConfirmingClear(false)
    setNote('')
    setReminder('')
    setDraftExamples([])
    await saveStudy(idiomId, {
      personal_note: '',
      personal_mistake_reminder: '',
    })
    await saveExamples(idiomId, [])
    setMessage(text.clearDone)
  }

  return <section className="paper mt-6 min-w-0 overflow-hidden rounded-2xl sm:mt-8 sm:rounded-3xl">
    <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 p-5 sm:p-8">
      <span className="status-review shrink-0 rounded-xl p-2"><NotebookPen size={20} /></span>
      <span className="min-w-0">
        <strong className="block text-lg text-indigo-950">{text.myNotes}</strong>
        <small className="mt-1 block break-words font-normal leading-5 text-slate-500">{text.syncHint}</small>
      </span>
    </div>
    {!user ? <div className="p-6 text-center sm:p-8">
      <p className="mx-auto max-w-sm text-[15px] leading-7 text-slate-500">{text.loginHint}</p>
      <LoginRequiredLink className="mt-4 w-full sm:w-auto" />
    </div> : <div className="min-w-0 p-5 sm:p-8">
      <label className="block text-sm font-bold text-slate-700">
        {text.myNote}
        <textarea
          value={note}
          onChange={event => { setNote(event.target.value); setMessage('') }}
          rows={5}
          className="focus-ring mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal leading-7 outline-none"
        />
      </label>
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-700">{text.myExamples}</h3>
          <button
            onClick={() => setDraftExamples([...draftExamples, { id: tempId(), content: '', sort_order: draftExamples.length }])}
            className="focus-ring inline-flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700"
          >
            <CirclePlus size={16} />{text.addExample}
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {!draftExamples.length && <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">{text.emptyExamples}</p>}
          {draftExamples.map((item, index) => <div key={item.id} className="flex min-w-0 items-start gap-2">
            <span className="mt-3 shrink-0 text-xs text-slate-400">{index + 1}</span>
            <textarea
              value={item.content}
              onChange={event => setDraftExamples(draftExamples.map(old => old.id === item.id ? { ...old, content: event.target.value } : old))}
              rows={2}
              className="focus-ring min-w-0 flex-1 rounded-xl border border-slate-200 p-3"
            />
            <button
              aria-label={`${text.deleteExample} ${index + 1}`}
              onClick={() => setDraftExamples(draftExamples.filter(old => old.id !== item.id))}
              className="delete-plain flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600"
            >
              <Trash2 size={17} />
            </button>
          </div>)}
        </div>
      </div>
      <label className="mt-6 block text-sm font-bold text-slate-700">
        {text.myMistakeReminder}
        <input
          value={reminder}
          onChange={event => { setReminder(event.target.value); setMessage('') }}
          className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-normal"
        />
      </label>
      <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
        <button onClick={() => void save()} className="btn btn-primary w-full sm:w-auto">
          <Save size={17} />{text.save}
        </button>
        <button onClick={() => setConfirmingClear(true)} className="btn btn-danger-quiet w-full sm:w-auto">
          <Trash2 size={17} />{text.clear}
        </button>
        {message && <span className={`break-words rounded-xl px-3 py-2 text-sm font-bold sm:ml-auto ${message.includes(text.saveFailed) ? 'notice-error' : 'notice-success'}`}>{message}</span>}
      </div>
    </div>}
    <ConfirmDialog
      open={confirmingClear}
      title={text.clearTitle}
      description={text.clearMessage}
      confirmText={text.confirmClear}
      cancelText={text.cancelClear}
      onConfirm={() => void clear()}
      onCancel={() => setConfirmingClear(false)}
    />
  </section>
}
