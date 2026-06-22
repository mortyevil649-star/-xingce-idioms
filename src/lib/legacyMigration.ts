import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Idiom, StudyRecord, UserIdiomExample } from '../types/database'

const legacyIds = ['zuo-zhi-you-chu','yan-bu-ji-yi','ji-qu-ao-ya','tou-shu-ji-qi','shou-shu-liang-duan','kong-gu-zu-yin','bu-jue-ru-lv','hun-shui-mo-yu','bian-chang-mo-ji','gai-xian-geng-zhang','ren-zhong-dao-yuan','da-xiang-jing-ting','nan-yi-wei-ji','ying-you-zhi-yi','qi-tou-bing-jin']

export async function migrateLegacyLocalData(user: User, idioms: Idiom[]) {
  if (!supabase || localStorage.getItem(`xingce-supabase-migrated-${user.id}`)) return
  try {
    const progress = JSON.parse(localStorage.getItem('xingce-idiom-progress-v1') || '{}') as Record<string, {status?:string;isFavorite?:boolean;nextReview?:string}>
    const notes = JSON.parse(localStorage.getItem('xingce-idiom-personal-notes-v1') || '{}') as Record<string, {remark?:string;mistakeReminder?:string;examples?:{text:string}[]}>
    const studies = legacyIds.flatMap((legacyId, index) => {
      const idiom = idioms.find(item => item.code === `IDM${String(index + 1).padStart(3,'0')}`)
      const old = progress[legacyId], note = notes[legacyId]
      if (!idiom || (!old && !note)) return []
      return [{ user_id:user.id, idiom_id:idiom.id, status:old?.status === 'mastered' ? '已掌握' : old?.status === 'mistake' ? '易错' : '未学', is_favorite:Boolean(old?.isFavorite), next_review:old?.nextReview || null, personal_note:note?.remark || '', personal_mistake_reminder:note?.mistakeReminder || '' }]
    })
    if (studies.length) {
      const { error } = await supabase.from('user_idiom_study').upsert(studies, { onConflict:'user_id,idiom_id' })
      if (error) throw error
    }
    const examples = legacyIds.flatMap((legacyId, index) => {
      const idiom = idioms.find(item => item.code === `IDM${String(index + 1).padStart(3,'0')}`)
      return idiom ? (notes[legacyId]?.examples ?? []).filter(item => item.text.trim()).map((item, sortOrder) => ({ user_id:user.id, idiom_id:idiom.id, content:item.text.trim(), sort_order:sortOrder })) : []
    })
    if (examples.length) {
      const { error } = await supabase.from('user_idiom_examples').insert(examples)
      if (error) throw error
    }
    localStorage.removeItem('xingce-idiom-progress-v1')
    localStorage.removeItem('xingce-idiom-personal-notes-v1')
    localStorage.setItem(`xingce-supabase-migrated-${user.id}`, '1')
  } catch (error) {
    console.error('旧学习记录迁移失败', error)
  }
}

export type StudyMap = Record<string, StudyRecord>
export type UserExamplesMap = Record<string, UserIdiomExample[]>
