import { mkdirSync, writeFileSync } from 'node:fs'
import { idioms } from '../src/data/idioms'
import { idiomKnowledge } from '../src/data/idiomKnowledge'

const quote = (value: string | null | undefined) => value == null ? 'null' : `'${value.replaceAll("'", "''")}'`
const textArray = (values: string[]) => values.length ? `array[${values.map(quote).join(', ')}]::text[]` : `array[]::text[]`
const idiomUuid = (index: number) => `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
const exampleUuid = (index: number) => `10000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`

const rows = idioms.map((idiom, index) => {
  const knowledge = idiomKnowledge[idiom.id]
  if (!idiom.title.trim()) throw new Error(`第 ${index + 1} 条缺少 title`)
  if (!idiom.meaning.trim()) throw new Error(`${idiom.title} 缺少 meaning`)
  return {
    id: idiomUuid(index),
    exampleId: exampleUuid(index),
    code: `IDM${String(index + 1).padStart(3, '0')}`,
    title: idiom.title.trim(),
    keyPronunciations: idiom.keyPronunciations?.map(item => `${item.char}（${item.reading}）`).join('、') || null,
    pronunciationNote: idiom.keyPronunciations?.map(item => item.note).filter(Boolean).join('；') || null,
    category: idiom.category,
    tags: idiom.tags,
    meaning: idiom.meaning.trim(),
    commonMistake: idiom.commonMistake?.trim() || '待人工核对',
    applicableObjects: knowledge?.applicableTo || '待人工核对',
    commonCollocations: knowledge?.collocations || [],
    usageRestrictions: knowledge?.restrictions || '待人工核对',
    difficulty: idiom.difficulty,
    source: idiom.source?.trim() || '待人工核对',
    example: idiom.example?.trim() || '待人工核对',
    sortOrder: index + 1,
  }
})

const codes = new Set(rows.map(row => row.code))
const titles = new Set(rows.map(row => row.title))
if (codes.size !== rows.length) throw new Error('存在重复 code')
if (titles.size !== rows.length) throw new Error('存在重复 title')

const idiomValues = rows.map(row => `  (${[
  quote(row.id), quote(row.code), quote(row.title), quote(row.keyPronunciations), quote(row.pronunciationNote),
  quote(row.category), textArray(row.tags), quote(row.meaning), quote(row.commonMistake), quote(row.applicableObjects),
  textArray(row.commonCollocations), quote(row.usageRestrictions), quote(row.difficulty), quote(row.source),
  'true', String(row.sortOrder), 'now()', 'now()'
].join(', ')})`).join(',\n')

const exampleValues = rows.map(row => `  (${quote(row.exampleId)}::uuid, ${quote(row.code)}::text, ${quote(row.example)}::text, 0::integer)`).join(',\n')

const sql = `-- 行测成语积累：Supabase 初始数据
-- 可直接在 Supabase SQL Editor 中完整执行。
-- 可重复执行：成语按 code 更新，标准例句按稳定 UUID 更新，不会重复累加。
-- 本文件不会删除表、清空数据、关闭 RLS 或修改任何权限策略。

begin;

insert into public.idioms (
  id, code, title, key_pronunciations, pronunciation_note,
  category, tags, meaning, common_mistake, applicable_objects,
  common_collocations, usage_restrictions, difficulty, source,
  is_visible, sort_order, created_at, updated_at
)
values
${idiomValues}
on conflict (code) do update set
  title = excluded.title,
  key_pronunciations = excluded.key_pronunciations,
  pronunciation_note = excluded.pronunciation_note,
  category = excluded.category,
  tags = excluded.tags,
  meaning = excluded.meaning,
  common_mistake = excluded.common_mistake,
  applicable_objects = excluded.applicable_objects,
  common_collocations = excluded.common_collocations,
  usage_restrictions = excluded.usage_restrictions,
  difficulty = excluded.difficulty,
  source = excluded.source,
  is_visible = excluded.is_visible,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.idiom_examples (
  id, idiom_id, content, sort_order, created_at, updated_at
)
select
  seed.id,
  idioms.id,
  seed.content,
  seed.sort_order,
  now(),
  now()
from (values
${exampleValues}
) as seed(id, code, content, sort_order)
join public.idioms on idioms.code = seed.code
on conflict (id) do update set
  idiom_id = excluded.idiom_id,
  content = excluded.content,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;

-- 导入验证
select count(*) as idioms_total from public.idioms;
select count(*) as idiom_examples_total from public.idiom_examples;
select code, title, category, difficulty, is_visible, sort_order
from public.idioms
order by sort_order, code
limit 20;
`

mkdirSync('supabase', { recursive: true })
writeFileSync('supabase/seed.sql', sql, 'utf8')
console.log(`已生成 supabase/seed.sql：${rows.length} 条成语，${rows.length} 条标准例句。`)
