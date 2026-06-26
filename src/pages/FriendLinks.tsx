import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { friendLinks } from '../data/friendLinks'

export function FriendLinks() {
  return <div className="mx-auto max-w-3xl">
    <Link to="/" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-slate-500 sm:mb-5"><ArrowLeft size={16} />返回首页</Link>
    <section className="paper rounded-2xl p-5 sm:rounded-3xl sm:p-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600">友情链接</p>
      <h1 className="display mt-3 text-3xl font-bold text-indigo-950 sm:text-4xl">备考与成语参考入口</h1>
      <p className="mt-3 text-[15px] leading-7 text-slate-500">这里整理了公考信息查询和成语释义参考网站。外部链接仅作学习参考，成语库线上数据仍以本站 Supabase 内容为准。</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {friendLinks.map(([label, href, description]) => <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="paper paper-hover block rounded-2xl p-4 shadow-none"
        >
          <span className="flex items-center justify-between gap-3">
            <strong className="text-base text-indigo-950">{label}</strong>
            <ExternalLink className="shrink-0 text-slate-400" size={16} />
          </span>
          <span className="mt-2 block text-sm leading-6 text-slate-500">{description}</span>
        </a>)}
      </div>
    </section>
  </div>
}
