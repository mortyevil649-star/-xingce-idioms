export function Pronunciation({ value, note, detail=false }: { value?: string | null; note?: string | null; detail?: boolean }) {
  if (!value?.trim()) return null
  return <div className="mt-2"><span className="chip bg-amber-100 text-amber-900">重点读音：{value}</span>{detail && note && <p className="mt-2 text-sm text-amber-800"><b>易读错提示：</b>{note}</p>}</div>
}
