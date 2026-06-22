import ExcelJS from 'exceljs'
import { mkdir } from 'node:fs/promises'
import { idioms } from '../src/data/idioms'
import { idiomKnowledge } from '../src/data/idiomKnowledge'

const headers = ['ID','成语','重点字读音','易读错提示','主分类','标签','准确释义','常见误用','正确例句','适用对象','常见搭配','使用限制','难度','来源/备注','是否展示','排序编号']
const workbook = new ExcelJS.Workbook()
workbook.creator = '行测成语积累'
workbook.created = new Date()
const sheet = workbook.addWorksheet('Idioms_Data', { views: [{ state:'frozen', ySplit:3 }] })

sheet.mergeCells('A1:P1')
sheet.getCell('A1').value = '行测成语内容数据源'
sheet.getCell('A1').font = { name:'Microsoft YaHei', size:18, bold:true, color:{argb:'FFFFFFFF'} }
sheet.getCell('A1').fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF312E81'} }
sheet.getCell('A1').alignment = { horizontal:'center', vertical:'middle' }
sheet.getRow(1).height = 34

sheet.mergeCells('A2:P2')
sheet.getCell('A2').value = '第 3 行为固定字段名；第 4 行起填写数据。多条例句用换行或 || 分隔。请勿重复 ID 或成语名称。'
sheet.getCell('A2').font = { name:'Microsoft YaHei', size:10, color:{argb:'FF475569'} }
sheet.getCell('A2').fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFF1F5F9'} }
sheet.getCell('A2').alignment = { horizontal:'left', vertical:'middle' }
sheet.getRow(2).height = 28

const headerRow = sheet.getRow(3)
headerRow.values = headers
headerRow.height = 28
headerRow.eachCell(cell => {
  cell.font = { name:'Microsoft YaHei', size:10, bold:true, color:{argb:'FFFFFFFF'} }
  cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF4F46E5'} }
  cell.alignment = { horizontal:'center', vertical:'middle', wrapText:true }
  cell.border = { bottom:{style:'thin',color:{argb:'FFC7D2FE'}} }
})

idioms.forEach((idiom,index) => {
  const knowledge = idiomKnowledge[idiom.id]
  const row = sheet.addRow([
    `IDM${String(index+1).padStart(3,'0')}`, idiom.title,
    idiom.keyPronunciations?.map(item=>`${item.char}（${item.reading}）`).join('、') || '',
    idiom.keyPronunciations?.map(item=>item.note).filter(Boolean).join('；') || '',
    idiom.category, idiom.tags.join('，'), idiom.meaning, idiom.commonMistake, idiom.example,
    knowledge?.applicableTo || '待人工核对', knowledge?.collocations.join('\n') || '',
    knowledge?.restrictions || '待人工核对', idiom.difficulty, idiom.source, '是', index+1,
  ])
  row.height = 52
  row.eachCell(cell => {
    cell.font = { name:'Microsoft YaHei', size:10, color:{argb:'FF1E293B'} }
    cell.alignment = { vertical:'top', wrapText:true }
    cell.border = { bottom:{style:'hair',color:{argb:'FFE2E8F0'}} }
  })
})

const widths = [12,14,18,30,14,20,42,38,42,32,36,32,13,28,12,12]
widths.forEach((width,index)=>sheet.getColumn(index+1).width=width)
for(let row=4;row<=500;row++){
  sheet.getCell(`M${row}`).dataValidation={type:'list',allowBlank:false,formulae:['"基础,进阶,高频易错"']}
  sheet.getCell(`O${row}`).dataValidation={type:'list',allowBlank:true,formulae:['"是,否"']}
}
sheet.autoFilter={from:{row:3,column:1},to:{row:3+idioms.length,column:headers.length}}
sheet.getColumn(1).numFmt='@'
await mkdir('data',{recursive:true})
await workbook.xlsx.writeFile('data/idioms.xlsx')
console.log(`已生成 data/idioms.xlsx：${idioms.length} 条成语。`)
