import { createClient } from '@supabase/supabase-js'
import { idioms as legacyIdioms } from '../src/data/idioms'
import { idiomKnowledge } from '../src/data/idiomKnowledge'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const email = process.env.SUPABASE_ADMIN_EMAIL
const password = process.env.SUPABASE_ADMIN_PASSWORD
if (!url || !key || !email || !password) throw new Error('缺少导入环境变量，请检查 .env.local')
if (key.startsWith('sb_secret_')) throw new Error('禁止使用 secret key，请改用 publishable key')

const supabase = createClient(url, key, { auth: { persistSession: false } })
const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
if (loginError) throw new Error(`管理员登录失败：${loginError.message}`)

const candidates = legacyIdioms.map((item, index) => {
  const knowledge = idiomKnowledge[item.id]
  return {
    idiom: {
      code: `IDM${String(index + 1).padStart(3, '0')}`,
      title: item.title.trim(),
      key_pronunciations: item.keyPronunciations?.map(entry => `${entry.char}（${entry.reading}）`).join('、') || null,
      pronunciation_note: item.keyPronunciations?.map(entry => entry.note).filter(Boolean).join('；') || null,
      category: item.category,
      tags: item.tags,
      meaning: item.meaning.trim(),
      common_mistake: item.commonMistake?.trim() || '待人工核对',
      applicable_objects: knowledge?.applicableTo || '待人工核对',
      common_collocations: knowledge?.collocations || [],
      usage_restrictions: knowledge?.restrictions || '待人工核对',
      difficulty: item.difficulty,
      source: item.source?.trim() || '待人工核对',
      is_visible: true,
      sort_order: index + 1,
    },
    examples: item.example?.trim() ? [item.example.trim()] : [],
  }
})

const duplicateCodes = candidates.filter((item, index, all) => all.findIndex(other => other.idiom.code === item.idiom.code) !== index).map(item => item.idiom.code)
const duplicateTitles = candidates.filter((item, index, all) => all.findIndex(other => other.idiom.title === item.idiom.title) !== index).map(item => item.idiom.title)
if (duplicateCodes.length || duplicateTitles.length) throw new Error(`导入前校验失败：重复 code=${duplicateCodes.join(',') || '无'}；重复 title=${duplicateTitles.join(',') || '无'}`)

const failed: { title:string; reason:string }[] = []
let imported = 0
for (const { idiom, examples } of candidates) {
  if (!idiom.title) { failed.push({title:'(空标题)',reason:'缺少 title'}); continue }
  if (!idiom.meaning) { failed.push({title:idiom.title,reason:'缺少 meaning'}); continue }
  const { data, error } = await supabase.from('idioms').upsert(idiom, { onConflict:'code' }).select('id').single()
  if (error || !data) { failed.push({title:idiom.title,reason:error?.message || '未返回 ID'}); continue }
  const { error: deleteError } = await supabase.from('idiom_examples').delete().eq('idiom_id',data.id)
  if (deleteError) { failed.push({title:idiom.title,reason:`清理旧例句失败：${deleteError.message}`}); continue }
  if (examples.length) {
    const { error: exampleError } = await supabase.from('idiom_examples').insert(examples.map((content,sort_order)=>({idiom_id:data.id,content,sort_order})))
    if (exampleError) { failed.push({title:idiom.title,reason:`例句导入失败：${exampleError.message}`}); continue }
  }
  imported += 1
  console.log(`成功：${idiom.code} ${idiom.title}`)
}

console.log(`\n导入完成：成功 ${imported} 条，失败 ${failed.length} 条。`)
if (failed.length) console.table(failed)
const [idiomCountResult, exampleCountResult] = await Promise.all([
  supabase.from('idioms').select('*', { count: 'exact', head: true }),
  supabase.from('idiom_examples').select('*', { count: 'exact', head: true }),
])
if (idiomCountResult.error) console.error(`读取 idioms 数量失败：${idiomCountResult.error.message}`)
if (exampleCountResult.error) console.error(`读取 idiom_examples 数量失败：${exampleCountResult.error.message}`)
console.log(`数据库当前数量：idioms=${idiomCountResult.count ?? '未知'}，idiom_examples=${exampleCountResult.count ?? '未知'}`)
await supabase.auth.signOut()
if (failed.length) process.exitCode = 1
