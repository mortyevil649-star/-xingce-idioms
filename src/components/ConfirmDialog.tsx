export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4">
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="paper w-full max-w-sm rounded-2xl p-5 shadow-2xl sm:p-6">
      <h2 id="confirm-title" className="text-lg font-bold text-indigo-950">{title}</h2>
      <p className="mt-2 text-[15px] leading-7 text-slate-600">{description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onCancel} className="btn btn-quiet w-full">{cancelText}</button>
        <button type="button" onClick={onConfirm} className="btn btn-primary w-full">{confirmText}</button>
      </div>
    </div>
  </div>
}
