# 行测成语积累

第一版专注成语学习，包含首页、成语库、详情页和随机抽查。数据与学习进度均保存在本地，不需要后端。

## 启动

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址。生产构建使用 `npm run build`，预览构建结果使用 `npm run preview`。

## 数据来源

项目根目录的 `工作簿1.xlsx` 是成语标题的唯一数据源。目前工作簿包含 15 条成语，对应的学习字段整理在 `src/data/idioms.ts`。代码中不得增加工作簿之外的成语。

收藏、学习状态和复习日期保存在浏览器 `localStorage` 的 `xingce-idiom-progress-v1` 项中。

## 从 Excel 补充

在 `工作簿1.xlsx` 第一列新增成语，然后为新增成语补齐 `src/data/idioms.ts` 中 `Idiom` 要求的释义、误用、例句等字段。无法确认的内容标记“待人工核对”。同步后运行 `npm run build`。
