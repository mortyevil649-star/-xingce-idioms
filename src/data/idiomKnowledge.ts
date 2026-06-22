export interface IdiomKnowledge {
  applicableTo: string
  collocations: string[]
  restrictions: string
}

export const idiomKnowledge: Record<string, IdiomKnowledge> = {
  'zuo-zhi-you-chu': { applicableTo: '人力、财力、能力或资源不足时的应付状态', collocations: ['人手不足，左支右绌', '预算紧张，左支右绌'], restrictions: '强调顾此失彼的困窘状态，不表示左右配合顺畅。' },
  'yan-bu-ji-yi': { applicableTo: '谈话、发言、文章等言语表达', collocations: ['闲谈终日，言不及义', '发言空泛，言不及义'], restrictions: '用于批评言谈不涉及正经道理，不表示“不讲义气”。' },
  'ji-qu-ao-ya': { applicableTo: '文章、文字、语言表达', collocations: ['文字佶屈聱牙', '文句佶屈聱牙'], restrictions: '一般不用于道路崎岖、事情难办或动作不流畅。' },
  'tou-shu-ji-qi': { applicableTo: '打击坏人、处理问题时因顾及相关人事物而有所顾忌', collocations: ['处理此事投鼠忌器', '顾及无辜，投鼠忌器'], restrictions: '必须含有“想采取行动但有所顾忌”的语意。' },
  'shou-shu-liang-duan': { applicableTo: '人的态度、立场和选择', collocations: ['态度首鼠两端', '在两个方案间首鼠两端'], restrictions: '强调犹豫或动摇，不用于形容方案本身有两个部分。' },
  'kong-gu-zu-yin': { applicableTo: '难得的音信、言论、见解或事物', collocations: ['此论堪称空谷足音', '佳音如空谷足音'], restrictions: '重在“难得、可贵”，不能只按山谷脚步声的字面使用。' },
  'bu-jue-ru-lv': { applicableTo: '细微悠长的声音，或十分危急、濒临断绝的局势', collocations: ['笛声不绝如缕', '局势不绝如缕'], restrictions: '不表示人或事物连续不断，不能替代“络绎不绝”。' },
  'hun-shui-mo-yu': { applicableTo: '人在混乱局面中谋取不正当利益的行为', collocations: ['企图浑水摸鱼', '趁乱浑水摸鱼'], restrictions: '含贬义，不用于赞扬灵活应变或正常获利。' },
  'bian-chang-mo-ji': { applicableTo: '权力、能力、影响力无法达到的事情或区域', collocations: ['管理上鞭长莫及', '远隔千里，鞭长莫及'], restrictions: '强调力量达不到，一般不单纯表示时间来不及。' },
  'gai-xian-geng-zhang': { applicableTo: '制度、方针、政策、方法等较系统的改革或变更', collocations: ['管理制度改弦更张', '旧有机制亟须改弦更张'], restrictions: '通常不是微小调整，也不只表示更换琴弦。' },
  'ren-zhong-dao-yuan': { applicableTo: '事业、任务、改革、建设、发展、使命、责任等', collocations: ['教育改革任重道远', '乡村振兴任重道远'], restrictions: '强调责任重大且需要长期努力，一般不直接形容具体物品或轻易完成的小事。' },
  'da-xiang-jing-ting': { applicableTo: '观点、结论、方案、表现等可比较的事物', collocations: ['两种观点大相径庭', '结论大相径庭'], restrictions: '表示差异很大，不能用于形容大体相同。' },
  'nan-yi-wei-ji': { applicableTo: '项目、经营、生活、制度或某种状态的持续', collocations: ['经营难以为继', '项目因缺乏资金难以为继'], restrictions: '强调无法继续，不表示难以选择继承人。' },
  'ying-you-zhi-yi': { applicableTo: '理念、制度、职责、服务等本应包含的内容', collocations: ['公平是法治的应有之义', '为民是公共服务的应有之义'], restrictions: '表示内在应当具备的含义，不是额外附加要求。' },
  'qi-tou-bing-jin': { applicableTo: '两个或多个方面、任务、事业共同推进', collocations: ['改革与发展齐头并进', '质量与效率齐头并进'], restrictions: '至少涉及两个方面，不用于单一对象独自前进。' },
}
