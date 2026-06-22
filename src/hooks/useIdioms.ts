import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Idiom } from '../types/database'

export function useIdioms(includeHidden = false) {
  const [idioms, setIdioms] = useState<Idiom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase) { setError('Supabase 环境变量缺失'); setLoading(false); return }
    let query = supabase.from('idioms').select('*, idiom_examples(*)').order('sort_order').order('created_at')
    if (!includeHidden) query = query.eq('is_visible', true)
    const { data, error: queryError } = await query
    if (queryError) setError(queryError.message)
    else {
      const rows = (data ?? []) as unknown as Idiom[]
      setIdioms(rows.map(row => ({ ...row, idiom_examples: [...(row.idiom_examples ?? [])].sort((a,b) => a.sort_order-b.sort_order) })))
      setError('')
    }
    setLoading(false)
  }, [includeHidden])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client.channel(`idioms-${includeHidden ? 'admin' : 'public'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idioms' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idiom_examples' }, refresh)
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [includeHidden, refresh])

  return { idioms, loading, error, refresh }
}
