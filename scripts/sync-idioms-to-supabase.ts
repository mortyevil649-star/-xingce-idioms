import ExcelJS from 'exceljs'
import dotenv from 'dotenv'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolve } from 'node:path'

const EXCEL_PATH=resolve('data/idioms.xlsx')
const SHEET_NAME='Idioms_Data'
const HEADER_ROW=3
const DATA_ROW=4
const writeMode=process.argv.includes('--write')

interface ExcelIdiom {
  row:number; code:string; title:string; key_pronunciations:string|null; pronunciation_note:string|null;
  category:string; tags:string[]; meaning:string; common_mistake:string|null; examples:string[];
  applicable_objects:string|null; common_collocations:string[]; usage_restrictions:string|null;
  difficulty:'基础'|'进阶'|'高频易错'; source:string|null; is_visible:boolean; sort_order:number;
}

const aliases:Record<string,string[]>={
  code:['ID','编号','code'],title:['成语','名称','title'],key_pronunciations:['重点字读音','重点读音'],pronunciation_note:['易读错提示','读音提示'],
  category:['主分类','分类'],tags:['标签'],meaning:['准确释义','释义'],common_mistake:['常见误用'],examples:['正确例句','标准例句'],
  applicable_objects:['适用对象'],common_collocations:['常见搭配'],usage_restrictions:['使用限制','不适用对象或使用限制'],difficulty:['难度'],
  source:['来源/备注','来源或备注','来源'],is_visible:['是否展示','展示状态'],sort_order:['排序编号','排序','sort_order']
}
const requiredHeaders=Object.keys(aliases)
const normalizeHeader=(value:string)=>value.trim().toLowerCase().replaceAll(/\s+/g,'')
const cellText=(cell:ExcelJS.Cell)=>{
  const value=cell.value
  if(value==null)return ''
  if(typeof value==='object'){
    if('richText' in value)return value.richText.map(item=>item.text).join('').trim()
    if('result' in value)return String(value.result??'').trim()
    if('text' in value)return String(value.text??'').trim()
  }
  return String(value).trim()
}
const splitList=(value:string)=>[...new Set(value.split(/[，,；;|\n\r]+/).map(item=>item.trim()).filter(Boolean))]
const splitExamples=(value:string)=>[...new Set(value.split(/\r?\n|\|\|/).map(item=>item.trim()).filter(Boolean))]
const equal=(a:unknown,b:unknown)=>JSON.stringify(a??null)===JSON.stringify(b??null)

async function readAndValidate(){
  const workbook=new ExcelJS.Workbook()
  try{await workbook.xlsx.readFile(EXCEL_PATH)}catch(error){throw new Error(`无法读取 ${EXCEL_PATH}：${error instanceof Error?error.message:String(error)}`)}
  const sheet=workbook.getWorksheet(SHEET_NAME)
  if(!sheet)throw new Error(`找不到工作表“${SHEET_NAME}”`)
  const columns=new Map<string,number>()
  sheet.getRow(HEADER_ROW).eachCell((cell,column)=>columns.set(normalizeHeader(cellText(cell)),column))
  const columnFor=(key:string)=>{for(const name of aliases[key]){const column=columns.get(normalizeHeader(name));if(column)return column}return 0}
  const missingHeaders=requiredHeaders.filter(key=>!columnFor(key)).map(key=>aliases[key][0])
  if(missingHeaders.length)throw new Error(`第 3 行缺少字段：${missingHeaders.join('、')}`)
  let lastRow=DATA_ROW-1
  for(let row=DATA_ROW;row<=sheet.rowCount;row++)if(requiredHeaders.some(key=>cellText(sheet.getCell(row,columnFor(key)))))lastRow=row
  if(lastRow<DATA_ROW)throw new Error('Excel 中没有成语数据（应从第 4 行开始）')
  const errors:string[]=[],records:ExcelIdiom[]=[],seenCodes=new Map<string,number>(),seenTitles=new Map<string,number>()
  for(let row=DATA_ROW;row<=lastRow;row++){
    const values=Object.fromEntries(requiredHeaders.map(key=>[key,cellText(sheet.getCell(row,columnFor(key)))])) as Record<string,string>
    if(Object.values(values).every(value=>!value)){errors.push(`第 ${row} 行是空白行，请删除或补全`);continue}
    const code=values.code.trim(),title=values.title.trim(),meaning=values.meaning.trim()
    if(!code)errors.push(`第 ${row} 行缺少 ID`)
    if(!title)errors.push(`第 ${row} 行缺少成语`)
    if(!meaning)errors.push(`第 ${row} 行（${title||code||'未知'}）缺少准确释义`)
    const examples=splitExamples(values.examples)
    if(!examples.length)errors.push(`第 ${row} 行（${title||code||'未知'}）正确例句为空`)
    if(code){const previous=seenCodes.get(code);if(previous)errors.push(`第 ${row} 行 ID“${code}”与第 ${previous} 行重复`);else seenCodes.set(code,row)}
    if(title){const previous=seenTitles.get(title);if(previous)errors.push(`第 ${row} 行成语“${title}”与第 ${previous} 行重复`);else seenTitles.set(title,row)}
    const visible=values.is_visible.trim().toLowerCase()
    if(!['','是','否','true','false','1','0','yes','no','显示','隐藏'].includes(visible))errors.push(`第 ${row} 行（${title||code}）“是否展示”只能填是、否或留空`)
    const difficulty=(values.difficulty||'基础') as ExcelIdiom['difficulty']
    if(!['基础','进阶','高频易错'].includes(difficulty))errors.push(`第 ${row} 行（${title||code}）难度无效：${values.difficulty}`)
    const sortOrder=values.sort_order?Number(values.sort_order):row-DATA_ROW+1
    if(!Number.isInteger(sortOrder))errors.push(`第 ${row} 行（${title||code}）排序编号必须是整数`)
    records.push({row,code,title,key_pronunciations:values.key_pronunciations||null,pronunciation_note:values.pronunciation_note||null,category:values.category||'其他',tags:splitList(values.tags),meaning,common_mistake:values.common_mistake||null,examples,applicable_objects:values.applicable_objects||null,common_collocations:splitList(values.common_collocations),usage_restrictions:values.usage_restrictions||null,difficulty,source:values.source||null,is_visible:!['否','false','0','no','隐藏'].includes(visible),sort_order:sortOrder})
  }
  if(errors.length)throw new Error(`Excel 校验失败，共 ${errors.length} 个问题：\n- ${errors.join('\n- ')}`)
  return records
}

const payload=(record:ExcelIdiom)=>({code:record.code,title:record.title,key_pronunciations:record.key_pronunciations,pronunciation_note:record.pronunciation_note,category:record.category,tags:record.tags,meaning:record.meaning,common_mistake:record.common_mistake,applicable_objects:record.applicable_objects,common_collocations:record.common_collocations,usage_restrictions:record.usage_restrictions,difficulty:record.difficulty,source:record.source,is_visible:record.is_visible,sort_order:record.sort_order})
const changed=(old:Record<string,unknown>,record:ExcelIdiom)=>Object.entries(payload(record)).some(([key,value])=>!equal(old[key],value))

async function sync(client:SupabaseClient,records:ExcelIdiom[]){
  const {data:existingRows,error:readError}=await client.from('idioms').select('*')
  if(readError)throw new Error(`读取 Supabase idioms 失败：${readError.message}`)
  const existingByCode=new Map((existingRows??[]).map(item=>[item.code,item]))
  let added=0,updated=0,hidden=0,skipped=0,failed=0
  for(const record of records){
    try{
      const existing=existingByCode.get(record.code) as Record<string,unknown>|undefined
      const idiomChanged=!existing||changed(existing,record)
      let idiomId=existing?.id as string|undefined
      if(idiomChanged){
        const {data,error}=await client.from('idioms').upsert(payload(record),{onConflict:'code'}).select('id').single()
        if(error)throw error
        idiomId=data.id
      }
      if(!idiomId)throw new Error('未取得 idiom_id')
      const {data:dbExamples,error:exampleReadError}=await client.from('idiom_examples').select('id,content,sort_order').eq('idiom_id',idiomId).order('sort_order')
      if(exampleReadError)throw exampleReadError
      const desired=new Map(record.examples.map((content,index)=>[content,index]))
      const seen=new Set<string>(),deleteIds:string[]=[]
      let examplesChanged=false
      for(const example of dbExamples??[]){
        const content=String(example.content).trim()
        if(seen.has(content)||!desired.has(content)){deleteIds.push(example.id);examplesChanged=true;continue}
        seen.add(content)
        const order=desired.get(content)!
        if(example.sort_order!==order){const {error}=await client.from('idiom_examples').update({sort_order:order}).eq('id',example.id);if(error)throw error;examplesChanged=true}
      }
      if(deleteIds.length){const {error}=await client.from('idiom_examples').delete().in('id',deleteIds);if(error)throw error}
      const missing=[...desired].filter(([content])=>!seen.has(content)).map(([content,sort_order])=>({idiom_id:idiomId,content,sort_order}))
      if(missing.length){const {error}=await client.from('idiom_examples').insert(missing);if(error)throw error;examplesChanged=true}
      if(!existing)added++
      else if(idiomChanged||examplesChanged)updated++
      else skipped++
      if(!record.is_visible&&(!existing||existing.is_visible!==false))hidden++
    }catch(error){failed++;console.error(`失败：第 ${record.row} 行 ${record.code} ${record.title}：${error instanceof Error?error.message:String(error)}`)}
  }
  const [idiomCount,exampleCount]=await Promise.all([client.from('idioms').select('*',{count:'exact',head:true}),client.from('idiom_examples').select('*',{count:'exact',head:true})])
  console.log('\n同步结果')
  console.table({新增:added,更新:updated,隐藏:hidden,跳过:skipped,失败:failed,'idioms 总数':idiomCount.count??'未知','idiom_examples 总数':exampleCount.count??'未知'})
  if(failed)process.exitCode=1
}

async function main(){
  const records=await readAndValidate()
  console.log(`Excel 校验通过：${records.length} 条成语，${records.reduce((sum,item)=>sum+item.examples.length,0)} 条标准例句。`)
  if(!writeMode){console.log('当前为只检查模式，没有写入 Supabase。');return}
  dotenv.config({path:resolve('.env.sync.local'),quiet:true})
  const missing=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'].filter(name=>!process.env[name]?.trim())
  if(missing.length)throw new Error(`无法同步：.env.sync.local 缺少 ${missing.join('、')}`)
  const client=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
  await sync(client,records)
}

main().catch(error=>{console.error(error instanceof Error?error.message:String(error));process.exitCode=1})
