# 项目维护说明

## 结构

- `工作簿1.xlsx`：成语标题唯一数据源。
- `src/config/exam.ts`：考试标题、日期、时区配置。
- `src/data/idioms.ts`：为 Excel 名单补充页面所需学习字段。
- `src/pages`：首页、列表、详情、随机抽查。
- `src/components`：布局、成语卡片、重点读音标签。
- `src/store.ts`：localStorage 学习记录读写。

## 数据同步规则

网站展示的成语必须与 `工作簿1.xlsx` 第一列严格一致。不得在代码中自行添加表格之外的成语。Excel 新增、删除或修改成语后，必须同步更新 `src/data/idioms.ts`，并核对两边标题集合完全相同。

每条记录必须符合 `Idiom` 接口，`id` 全局唯一且稳定。`category`、`difficulty`、`status` 必须使用类型中已有枚举值。`pinyin` 字段仅为兼容导入保留，页面禁止展示完整拼音。

仅当存在易读错、多音字、古音或高频考查读音时填写 `keyPronunciations`。释义、误用、例句应以权威词典或官方语料核验，无法确认时写“待人工核对”，不得编造。

数据同步后运行 `npm run build`，并检查首页总数、搜索结果、详情页和随机抽查。
