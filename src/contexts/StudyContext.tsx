import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { migrateLegacyLocalData, type StudyMap, type UserExamplesMap } from '../lib/legacyMigration'
import { useAuth } from './AuthContext'
import type { Idiom } from '../types/database'
import type { StudyRecord, StudyStatus, UserIdiomExample } from '../types/database'

interface StudyPatch { status?: StudyStatus; is_favorite?: boolean; personal_note?: string; personal_mistake_reminder?: string; next_review?: string | null }
interface StudyValue {
  records: StudyMap
  examples: UserExamplesMap
  saveStudy: (idiomId: string, patch: StudyPatch) => Promise<void>
  saveExamples: (idiomId: string, items: Pick<UserIdiomExample,'id'|'content'|'sort_order'>[]) => Promise<void>
  refresh: () => Promise<void>
}

const StudyContext = createContext<StudyValue | null>(null)

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<StudyMap>({})
  const [examples, setExamples] = useState<UserExamplesMap>({})

  const refresh = useCallback(async () => {
    if (!supabase || !user) { setRecords({}); setExamples({}); return }
    const [studyResult, exampleResult] = await Promise.all([
      supabase.from('user_idiom_study').select('*').eq('user_id', user.id),
      supabase.from('user_idiom_examples').select('*').eq('user_id', user.id).order('sort_order'),
    ])
    if (!studyResult.error) setRecords(Object.fromEntries(((studyResult.data ?? []) as StudyRecord[]).map(item => [item.idiom_id,item])))
    if (!exampleResult.error) {
      const grouped: UserExamplesMap = {}
      for (const item of (exampleResult.data ?? []) as UserIdiomExample[]) (grouped[item.idiom_id] ??= []).push(item)
      setExamples(grouped)
    }
  }, [user])

  useEffect(() => {
    if (!supabase || !user) { void refresh(); return }
    let active = true
    supabase.from('idioms').select('*').order('sort_order').then(({data}) => {
      if (active) void migrateLegacyLocalData(user, (data ?? []) as Idiom[]).then(refresh)
    })
    return () => { active = false }
  }, [user, refresh])
  useEffect(() => {
    const client = supabase
    if (!client || !user) return
    const channel = client.channel(`study-${user.id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'user_idiom_study', filter:`user_id=eq.${user.id}` }, refresh)
      .on('postgres_changes', { event:'*', schema:'public', table:'user_idiom_examples', filter:`user_id=eq.${user.id}` }, refresh)
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [user, refresh])

  const value = useMemo<StudyValue>(() => ({ records, examples, refresh,
    saveStudy: async (idiomId, patch) => {
      if (!supabase || !user) throw new Error('请先登录后再保存学习记录')
      const current = records[idiomId]
      const payload = { user_id:user.id, idiom_id:idiomId, status:current?.status ?? '未学' as StudyStatus, is_favorite:current?.is_favorite ?? false, personal_note:current?.personal_note ?? '', personal_mistake_reminder:current?.personal_mistake_reminder ?? '', next_review:current?.next_review ?? null, ...patch }
      const { error } = await supabase.from('user_idiom_study').upsert(payload, { onConflict:'user_id,idiom_id' })
      if (error) throw error
      await refresh()
    },
    saveExamples: async (idiomId, items) => {
      if (!supabase || !user) throw new Error('请先登录后再保存我的例句')
      const existing = examples[idiomId] ?? []
      const keepIds = new Set(items.map(item => item.id).filter(Boolean))
      const deleteIds = existing.filter(item => !keepIds.has(item.id)).map(item => item.id)
      if (deleteIds.length) { const { error } = await supabase.from('user_idiom_examples').delete().in('id', deleteIds); if (error) throw error }
      for (const item of items) {
        if (existing.some(old => old.id === item.id)) {
          const { error } = await supabase.from('user_idiom_examples').update({content:item.content,sort_order:item.sort_order}).eq('id',item.id); if (error) throw error
        } else if (item.content.trim()) {
          const { error } = await supabase.from('user_idiom_examples').insert({user_id:user.id,idiom_id:idiomId,content:item.content.trim(),sort_order:item.sort_order}); if (error) throw error
        }
      }
      await refresh()
    },
  }), [records, examples, user, refresh])

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const value = useContext(StudyContext)
  if (!value) throw new Error('useStudy 必须在 StudyProvider 内使用')
  return value
}
