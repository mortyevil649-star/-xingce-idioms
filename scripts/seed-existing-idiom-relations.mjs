import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.sync.local', quiet: true })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  throw new Error('缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请先配置 .env.sync.local')
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const idiomRelations = [
  ['左支右绌', '捉襟见肘', 'confusion', '左支右绌强调力量不足、顾此失彼；捉襟见肘强调处境窘迫、资源不足。', 10],
  ['首鼠两端', '悬而未决', 'related', '首鼠两端强调人犹豫不决；悬而未决强调事情迟迟没有定论。', 20],
  ['不绝如缕', '难以为继', 'confusion', '不绝如缕多指声音细微连绵或形势危急未断；难以为继强调无法继续维持。', 30],
  ['改弦更张', '胶柱鼓瑟', 'antonym', '改弦更张强调改变制度、方法或方向；胶柱鼓瑟强调拘泥固执、不知变通。', 40],
  ['改弦更张', '固步自封', 'antonym', '改弦更张强调主动调整改变；固步自封强调守旧停滞、不求进步。', 50],
  ['不落窠臼', '胶柱鼓瑟', 'antonym', '不落窠臼强调有新意、不落俗套；胶柱鼓瑟强调机械固执、拘泥成法。', 60],
  ['投鼠忌器', '鞭长莫及', 'confusion', '投鼠忌器强调因有所顾忌而不敢行动；鞭长莫及强调力量或距离达不到。', 70],
  ['临渴掘井', '釜底抽薪', 'related', '临渴掘井强调事到临头才补救；釜底抽薪强调从根本上解决问题。', 80],
  ['熟视无睹', '安之若素', 'confusion', '熟视无睹强调看惯后像没看见、不重视；安之若素强调面对异常仍平静如常。', 90],
  ['跃然纸上', '纤毫毕现', 'related', '跃然纸上强调形象生动鲜明；纤毫毕现强调细节极其清楚地呈现。', 100],
  ['言不及义', '敷衍塞责', 'related', '言不及义强调说话没有触及正题或道理；敷衍塞责强调做事应付、不负责任。', 110],
  ['左支右绌', '难以为继', 'related', '左支右绌强调多方应付不过来；难以为继强调整体上无法持续下去。', 120],
]

const termRelations = [
  {
    sourceTitle: '临渴掘井',
    targetTitle: '未雨绸缪',
    relation_type: 'antonym',
    comparison_note: '临渴掘井指事到临头才想办法；未雨绸缪指事先做好防备。',
    sort_order: 130,
    meaning: '比喻事先做好准备。',
    source: '释义参考：汉典、百度汉语、汉程成语；待人工核对。',
  },
]

function relationKey(sourceId, targetId, type) {
  return [sourceId < targetId ? sourceId : targetId, sourceId < targetId ? targetId : sourceId, type].join('|')
}

const { data: idioms, error: idiomError } = await supabase
  .from('idioms')
  .select('id,title')
  .order('sort_order')
if (idiomError) throw idiomError

const idiomByTitle = new Map((idioms ?? []).map(item => [item.title, item]))

const { data: existingRelations, error: relationReadError } = await supabase
  .from('idiom_relations')
  .select('source_id,target_id,relation_type')
if (relationReadError) throw relationReadError

const existingIdiomKeys = new Set(
  (existingRelations ?? [])
    .filter(item => item.target_id)
    .map(item => relationKey(item.source_id, item.target_id, item.relation_type)),
)

let addedIdiomRelations = 0
let skippedIdiomRelations = 0
const missingIdiomRelations = []

for (const [sourceTitle, targetTitle, relation_type, comparison_note, sort_order] of idiomRelations) {
  const source = idiomByTitle.get(sourceTitle)
  const target = idiomByTitle.get(targetTitle)
  if (!source || !target) {
    missingIdiomRelations.push({ sourceTitle, targetTitle })
    skippedIdiomRelations += 1
    continue
  }
  const keyValue = relationKey(source.id, target.id, relation_type)
  if (existingIdiomKeys.has(keyValue)) {
    skippedIdiomRelations += 1
    continue
  }
  const { error } = await supabase.from('idiom_relations').insert({
    source_id: source.id,
    target_id: target.id,
    relation_type,
    comparison_note,
    is_published: true,
    sort_order,
  })
  if (error) throw error
  existingIdiomKeys.add(keyValue)
  addedIdiomRelations += 1
}

let addedTerms = 0
let addedTermRelations = 0
let skippedTermRelations = 0
let termLibraryReady = true

const { error: termProbeError } = await supabase
  .from('idiom_relations')
  .select('target_term_id', { count: 'exact', head: true })

if (termProbeError) {
  termLibraryReady = false
} else {
  const { data: terms, error: termsReadError } = await supabase
    .from('idiom_relation_terms')
    .select('id,title')
  if (termsReadError) throw termsReadError
  const termByTitle = new Map((terms ?? []).map(item => [item.title, item]))

  for (const item of termRelations) {
    const source = idiomByTitle.get(item.sourceTitle)
    if (!source) {
      skippedTermRelations += 1
      continue
    }
    let term = termByTitle.get(item.targetTitle)
    if (!term) {
      const { data, error } = await supabase
        .from('idiom_relation_terms')
        .insert({
          title: item.targetTitle,
          meaning: item.meaning,
          source: item.source,
          is_published: true,
        })
        .select('id,title')
        .single()
      if (error) throw error
      term = data
      termByTitle.set(item.targetTitle, term)
      addedTerms += 1
    }

    const { data: existingTermRelation, error: existingTermRelationError } = await supabase
      .from('idiom_relations')
      .select('id')
      .eq('source_id', source.id)
      .eq('target_term_id', term.id)
      .eq('relation_type', item.relation_type)
      .maybeSingle()
    if (existingTermRelationError) throw existingTermRelationError
    const alreadyExists = Boolean(existingTermRelation)
    if (alreadyExists) {
      skippedTermRelations += 1
      continue
    }

    const { error } = await supabase.from('idiom_relations').insert({
      source_id: source.id,
      target_id: null,
      target_term_id: term.id,
      relation_type: item.relation_type,
      comparison_note: item.comparison_note,
      is_published: true,
      sort_order: item.sort_order,
    })
    if (error) throw error
    addedTermRelations += 1
  }
}

const { count: relationCount } = await supabase
  .from('idiom_relations')
  .select('*', { count: 'exact', head: true })

console.log(JSON.stringify({
  addedIdiomRelations,
  skippedIdiomRelations,
  missingIdiomRelations,
  termLibraryReady,
  addedTerms,
  addedTermRelations,
  skippedTermRelations,
  relationCount,
}, null, 2))
