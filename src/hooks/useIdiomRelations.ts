import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { IdiomRelation, IdiomRelationTerm } from '../types/database'

export function useIdiomRelations(includeHidden = false) {
  const [relations, setRelations] = useState<IdiomRelation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!supabase) {
      setError('Supabase 环境变量缺失')
      setLoading(false)
      return
    }

    let query = supabase
      .from('idiom_relations')
      .select('*')
      .order('sort_order')
      .order('created_at')

    if (!includeHidden) query = query.eq('is_published', true)

    const { data, error: queryError } = await query
    const { data: terms, error: termsError } = await supabase
      .from('idiom_relation_terms')
      .select('*')
      .order('title')
    const termTableMissing = termsError?.code === '42P01' || termsError?.code === '42703'
    if (queryError || (termsError && !termTableMissing)) setError(queryError?.message || termsError?.message || '')
    else {
      const termsById = new Map(((termTableMissing ? [] : terms ?? []) as IdiomRelationTerm[]).map(term => [term.id, term]))
      setRelations(((data ?? []) as IdiomRelation[]).map(relation => ({
        ...relation,
        target_term: relation.target_term_id ? termsById.get(relation.target_term_id) ?? null : null
      })))
      setError('')
    }
    setLoading(false)
  }, [includeHidden])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client.channel(`idiom-relations-${includeHidden ? 'admin' : 'public'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idiom_relations' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idiom_relation_terms' }, refresh)
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [includeHidden, refresh])

  return { relations, loading, error, refresh }
}
