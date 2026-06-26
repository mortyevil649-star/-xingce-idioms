export function Pronunciation({ value, note, detail=false }: { value?: string | null; note?: string | null; detail?: boolean }) {
  if (!value?.trim()) return null
  return <div className="mt-2"><span className="chip status-review">重点读音：{value}</span>{detail && note && <p className="mt-2 text-sm leading-6 text-amber-800"><b>易读错提示：</b>{note}</p>}</div>
}
