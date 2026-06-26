import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IdiomCard } from '../components/IdiomCard'
import { useStudy } from '../contexts/StudyContext'
import { useIdioms } from '../hooks/useIdioms'
import { getExamFrequency } from '../lib/examFrequency'

const states = [['all', '全部'], ['未学', '未学习'], ['已掌握', '已掌握'], ['易错', '易错'], ['favorite', '已收藏']] as const
const sortOptions = [
  ['default', '默认排序'],
  ['exam-frequency', '考频从高到低'],
  ['title', '成语名称排序'],
] as const

type StateFilter = (typeof states)[number][0]
type SortKey = (typeof sortOptions)[number][0]

export function IdiomList() {
  const { idioms, loading, error } = useIdioms()
  const { records } = useStudy()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [state, setState] = useState<StateFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const categories = useMemo(() => [...new Set(idioms.map(item => item.category))], [idioms])
  const result = useMemo(() => {
    const filtered = idioms.filter(idiom => {
      const record = records[idiom.id]
      const text = `${idiom.title} ${idiom.meaning} ${idiom.tags.join(' ')}`.toLowerCase()
      return (!query || text.includes(query.toLowerCase()))
        && (!category || idiom.category === category)
        && (!difficulty || idiom.difficulty === difficulty)
        && (state === 'all' || state === 'favorite' ? state === 'all' || record?.is_favorite : (record?.status ?? '未学') === state)
    })
    if (sortKey === 'exam-frequency') {
      return [...filtered].sort((a, b) => getExamFrequency(b) - getExamFrequency(a) || a.sort_order - b.sort_order)
    }
    if (sortKey === 'title') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN') || a.sort_order - b.sort_order)
    }
    return filtered
  }, [idioms, records, query, category, difficulty, state, sortKey])
  const reset = () => { setQuery(''); setCategory(''); setDifficulty(''); setState('all'); setSortKey('default') }

  return <div>
    <div className="mb-5 sm:mb-7">
      <p className="text-sm font-bold text-indigo-600">成语库 · {idioms.length} 条</p>
      <h1 className="display mt-2 text-3xl font-bold leading-tight text-indigo-950 sm:text-4xl">从用法里，把词记牢</h1>
    </div>
    <div className="paper rounded-2xl p-4 sm:p-5">
      <label className="relative block">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={19} />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索成语、释义或标签" className="focus-ring min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none" />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select value={category} onChange={event => setCategory(event.target.value)} className="focus-ring min-h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white p-3">
          <option value="">全部分类</option>
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="focus-ring min-h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white p-3">
          <option value="">全部难度</option>
          {['基础', '进阶', '高频易错'].map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={sortKey} onChange={event => setSortKey(event.target.value as SortKey)} className="focus-ring min-h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white p-3">
          {sortOptions.map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {states.map(([key, label]) => <button key={key} onClick={() => setState(key)} className={`focus-ring chip min-h-11 ${state === key ? 'bg-indigo-700 text-white' : 'status-idle'}`}>{label}</button>)}
        {(query || category || difficulty || state !== 'all' || sortKey !== 'default') && <button onClick={reset} className="chip status-idle min-h-11"><X size={14} />清除筛选</button>}
      </div>
    </div>
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <div className="my-5 text-sm text-slate-500">{loading ? '正在读取…' : <>找到 <b className="text-indigo-800">{result.length}</b> 条成语</>}</div>
    {!loading && (result.length ? <div className="idiom-list-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{result.map(idiom => <IdiomCard key={idiom.id} idiom={idiom} />)}</div> : <div className="paper rounded-2xl py-20 text-center text-slate-500">没有符合条件的成语。</div>)}
  </div>
}
