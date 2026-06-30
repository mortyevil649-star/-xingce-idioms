import { ArrowRight, BookOpen, CalendarCheck2, CheckCircle2, Clock3, Shuffle, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { examConfig } from '../config/exam'
import { Pronunciation } from '../components/Pronunciation'
import { useStudy } from '../contexts/StudyContext'
import { useIdioms } from '../hooks/useIdioms'

const dailyTips = [
  {
    title: '先辨使用对象，再看常见搭配。',
    detail: '今天学习时，先问自己：这个成语通常形容人、事情、文章，还是局面？对象辨准了，误用会少一大半。',
    actions: ['圈出适用对象', '记 1 个常见搭配', '自写 1 个例句'],
  },
  {
    title: '遇到熟悉的词，也要停一秒。',
    detail: '很多高频易错成语不是“不认识”，而是“想当然”。先不要急着点已掌握，回看释义里的关键词。',
    actions: ['复述准确释义', '标出易错点', '加入易混对比'],
  },
  {
    title: '把褒贬色彩单独记出来。',
    detail: '做言语题时，感情色彩往往比字面意思更快排除选项。今天重点留意褒义、贬义和中性表达。',
    actions: ['判断褒贬', '找语境对象', '记录错因'],
  },
  {
    title: '优先复习“会看错”的成语。',
    detail: '如果一个成语总让你想到另一个意思，就把它放进易错提醒。短句提醒比长段解释更容易在考场唤醒记忆。',
    actions: ['补一句提醒', '看标准例句', '明天再复习'],
  },
  {
    title: '不要只背释义，要背使用场景。',
    detail: '行测考查常把成语放进具体语境。记住“什么场景能用”，比单独背一句释义更稳。',
    actions: ['看场景', '记搭配', '排除不适用对象'],
  },
  {
    title: '今天只抓一个“易混点”。',
    detail: '不要贪多。挑一个你总分不清的近义成语，写下它和另一个词的差别，越短越好。',
    actions: ['找近义词', '写差别', '做一次抽查'],
  },
  {
    title: '把例句当成小语境题来读。',
    detail: '看例句时别只扫一眼，先判断主语和语境，再回到成语本身。这样记住的是用法，不只是字面意思。',
    actions: ['圈主语', '看语境', '复述用法'],
  },
  {
    title: '先处理高频易错，再补基础词。',
    detail: '备考时间有限，优先把会造成选项误判的词拿下。高频易错词每天少量滚动，效果比临时突击更稳。',
    actions: ['筛高频易错', '标记易错', '明天复盘'],
  },
  {
    title: '今天练“反向排除”。',
    detail: '看到一个成语，先想它不能用于什么对象。知道边界，才能在题目里快速排除干扰项。',
    actions: ['写使用限制', '找反例语境', '加入笔记'],
  },
  {
    title: '给每个易错词配一个短提醒。',
    detail: '提醒不需要长，能在考场唤醒你就够了。比如“只形容人”“偏贬义”“不能接具体物品”。',
    actions: ['写短提醒', '收藏词条', '晚间复习'],
  },
  {
    title: '读音只记真正会错的字。',
    detail: '不要把整条拼音当负担。今天重点看“重点读音”，尤其是多音字和考试容易设坑的字。',
    actions: ['看重点读音', '读两遍', '写易错提示'],
  },
  {
    title: '做一轮小复盘，不追求数量。',
    detail: '复盘时只问三件事：我会不会解释？会不会造句？会不会避开误用对象？能回答就算真正进步。',
    actions: ['解释一遍', '造一个句', '检查误用'],
  },
  {
    title: '把“看懂”变成“会用”。',
    detail: '成语题常考的是能不能放进正确语境。今天每学一个词，至少补一个自己的例句。',
    actions: ['补我的例句', '看搭配', '标状态'],
  },
  {
    title: '今天专盯褒贬误用。',
    detail: '遇到带态度色彩的词，先判断它是夸、贬，还是中性。感情色彩错了，释义背得再熟也容易选错。',
    actions: ['标褒贬', '看例句', '记错因'],
  },
]

const encouragements = [
  '真正拉开差距的，不是某一天学很多，而是每一天都没有断线。',
  '把今天这一点点弄明白，考场上就少一个模糊选项。',
  '慢慢来，但别停下。成语积累最怕急，也最奖励坚持。',
  '今天记住一个适用对象，明天就能少踩一个语境陷阱。',
  '你不是在背一堆词，而是在训练自己更准确地判断语境。',
  '别急着证明自己学得快，先让每一个词都落到能用的地方。',
  '今天的五分钟不是微不足道，它是在给明天的判断力铺路。',
  '把模糊的地方写下来，就是在给下次做题的自己递答案。',
  '真正稳的人，不靠临场灵感，靠平时一次次把边界分清。',
  '你今天多辨清一个对象，考场上就少一次犹豫。',
  '学习不是一直兴奋，而是在普通的一天里也愿意往前挪一点。',
  '别怕慢。慢一点学清楚，比快一点忘干净更值。',
  '每一次复习，都是在把“眼熟”变成“确定”。',
  '今天把一个易错词讲明白，就已经赢过昨天的自己一点点。',
  '越接近考试，越要相信稳定的小动作：看释义、辨对象、写提醒。',
]

const dayMs = 86400000
const shanghaiOffsetMs = 8 * 60 * 60 * 1000
const lastLearningKey = 'xingce-last-learning-idiom-id'

function getShanghaiDayStamp() {
  return Math.floor((Date.now() + shanghaiOffsetMs) / dayMs)
}

function getShanghaiDateKey(offsetDays = 0) {
  const date = new Date((getShanghaiDayStamp() + offsetDays) * dayMs)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function getMsUntilNextShanghaiMidnight() {
  const nextMidnightUtc = (getShanghaiDayStamp() + 1) * dayMs - shanghaiOffsetMs
  return Math.max(1000, nextMidnightUtc - Date.now() + 1000)
}

function updateCheckinStreak() {
  if (typeof window === 'undefined') return 1
  const todayKey = getShanghaiDateKey()
  const lastKey = window.localStorage.getItem('xingce-checkin-date')
  const current = Number(window.localStorage.getItem('xingce-checkin-streak') || '0')
  if (lastKey === todayKey) return Math.max(1, current || 1)
  const yesterdayKey = getShanghaiDateKey(-1)
  const next = lastKey === yesterdayKey ? current + 1 : 1
  window.localStorage.setItem('xingce-checkin-date', todayKey)
  window.localStorage.setItem('xingce-checkin-streak', String(next))
  return next
}

export function Home() {
  const { idioms, loading, error } = useIdioms()
  const { records } = useStudy()
  const [reviewSize, setReviewSize] = useState(10)
  const [streakDays, setStreakDays] = useState(1)
  const [dailyStamp, setDailyStamp] = useState(() => getShanghaiDayStamp())
  useEffect(() => {
    const refresh = () => {
      setDailyStamp(getShanghaiDayStamp())
      setStreakDays(updateCheckinStreak())
    }
    const timer = setInterval(refresh, 60000)
    const midnightTimer = setTimeout(refresh, getMsUntilNextShanghaiMidnight())
    return () => {
      clearInterval(timer)
      clearTimeout(midnightTimer)
    }
  }, [])
  useEffect(() => setStreakDays(updateCheckinStreak()), [])
  const days = Math.max(0, Math.ceil((new Date(examConfig.targetDate).getTime() - Date.now()) / 86400000))
  const recordValues = Object.values(records)
  const mastered = recordValues.filter(item => item.status === '已掌握').length
  const mistakes = recordValues.filter(item => item.status === '易错').length
  const reviewCount = mastered
  const estimatedMinutes = Math.max(1, Math.ceil(reviewSize * 0.75))
  const random = useMemo(() => idioms.length ? idioms[Math.floor(Math.random() * idioms.length)] : null, [idioms])
  const startLearningPath = useMemo(() => {
    if (!idioms.length || typeof window === 'undefined') return '/idioms'
    const lastId = window.localStorage.getItem(lastLearningKey)
    const target = idioms.find(item => item.id === lastId) ?? idioms[0]
    return `/idioms/${target.id}`
  }, [idioms])
  const dailyTip = useMemo(() => {
    const dayIndex = dailyStamp % dailyTips.length
    return dailyTips[dayIndex]
  }, [dailyStamp])
  const encouragement = useMemo(() => {
    const dayIndex = (dailyStamp + 3) % encouragements.length
    return encouragements[dayIndex]
  }, [dailyStamp])

  return <div>
    <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <div className="overflow-hidden rounded-2xl bg-indigo-950 p-5 text-white sm:rounded-3xl sm:p-10">
        <p className="text-sm font-bold tracking-[.2em] text-indigo-300">每天积累一点</p>
        <h1 className="display mt-4 text-3xl font-bold leading-tight min-[390px]:text-4xl sm:mt-5 sm:text-6xl">把容易混淆的词，<br /><span className="text-amber-300">真正分清楚。</span></h1>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-indigo-200 sm:mt-6 sm:text-base">专注行测高频易错成语。</p>
        <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
          <Link className="btn w-full bg-white text-indigo-950 sm:w-auto" to={startLearningPath}>开始学习 <ArrowRight size={18} /></Link>
          <Link className="btn w-full border border-indigo-700/70 text-white sm:w-auto" to="/quiz"><Shuffle size={17} />随机抽查</Link>
        </div>
      </div>
      <div className="paper flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl p-5 sm:min-h-64 sm:rounded-3xl sm:p-7">
        <div>
          <p className="text-sm font-bold text-indigo-600">{examConfig.title}</p>
          <div className="mt-5 flex min-w-0 items-end gap-2"><strong className="countdown-number text-indigo-950">{days}</strong><span className="countdown-unit shrink-0 text-slate-600">天</span></div>
        </div>
        <div className="border-t border-slate-100 pt-4 text-[15px] text-slate-500">
          <p>目标日期 · {examConfig.displayDate}</p>
          <p className="mt-1 text-xs">{examConfig.timezone} 时区</p>
        </div>
      </div>
    </section>

    {error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

    <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <div className="paper rounded-2xl p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest text-amber-600">今日学习提示</p>
        <p className="display mt-3 text-lg font-bold leading-8 text-slate-800 sm:text-xl">{dailyTip.title}</p>
        <p className="mt-3 text-[15px] leading-7 text-slate-500">{dailyTip.detail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dailyTip.actions.map(action => <span key={action} className="chip status-review">{action}</span>)}
        </div>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">小节奏：先学 5 个新成语，再复习已掌握成语，最后把一个易错点写进“我的笔记”。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [idioms.length, '成语总数', BookOpen, 'text-indigo-700'],
          [mastered, '已掌握', CheckCircle2, 'text-emerald-600'],
          [reviewCount, '可复习', Clock3, 'text-amber-600'],
          [mistakes, '易错', TriangleAlert, 'text-rose-600'],
        ].map(([value, label, Icon, color]) => <div key={String(label)} className="paper flex items-center gap-4 rounded-2xl p-4 sm:block sm:p-5">
          {typeof Icon !== 'string' && typeof Icon !== 'number' && <Icon className={String(color)} size={20} />}
          <div><strong className="block text-2xl sm:mt-4 sm:text-3xl">{String(value)}</strong><span className="text-sm text-slate-500">{String(label)}</span></div>
        </div>)}
        <div className="paper col-span-full overflow-hidden rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="status-mastered flex size-12 shrink-0 items-center justify-center rounded-2xl"><CalendarCheck2 size={22} /></span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">已坚持打卡天数</p>
                <p className="mt-1 text-3xl font-extrabold leading-none text-indigo-950 sm:text-4xl">{streakDays}<span className="ml-1 text-base font-bold text-slate-500">天</span></p>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl bg-slate-50 p-4 sm:max-w-xl">
              <p className="text-xs font-bold tracking-widest text-indigo-600">今日寄语</p>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">{encouragement}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="paper mt-4 rounded-2xl p-5 sm:mt-5 sm:rounded-3xl sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-emerald-600">每日复习成语</p>
          <h2 className="display mt-3 text-2xl font-bold text-indigo-950 sm:text-3xl">复习范围：已掌握成语。</h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-500">从你标记为“已掌握”的成语中生成复习组。本组 {reviewSize} 个，预计约 {estimatedMinutes} 分钟。</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <label className="block text-sm font-bold text-slate-700">每组成语数量
            <input type="number" min={1} max={50} value={reviewSize} onChange={event => setReviewSize(Math.max(1, Math.min(50, Number(event.target.value) || 1)))} className="focus-ring mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" />
          </label>
          <p className="mt-2 text-xs text-slate-400">按每个约 45 秒估算。</p>
          <Link to={`/review?count=${reviewSize}`} className="btn btn-primary mt-4 w-full">开始每日复习 <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>

    <section className="paper mt-4 rounded-2xl p-5 sm:mt-5 sm:rounded-3xl sm:p-8">
      {loading ? <p className="text-slate-500">正在读取成语…</p> : random ? <>
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-indigo-500">随机成语卡片</p>
            <h2 className="display mt-3 break-words text-2xl font-bold text-indigo-950 sm:text-3xl">{random.title}</h2>
            <Pronunciation value={random.key_pronunciations} />
          </div>
          <span className="chip status-primary hidden sm:inline-flex">{random.category}</span>
        </div>
        <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 sm:text-base">{random.meaning}</p>
        <Link to={`/idioms/${random.id}`} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-indigo-700 sm:mt-5">查看详情 <ArrowRight size={16} /></Link>
      </> : <p className="text-slate-500">暂时没有已展示的成语。</p>}
    </section>
  </div>
}
