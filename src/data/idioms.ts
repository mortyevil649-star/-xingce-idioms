export type IdiomStatus = 'unlearned' | 'mastered' | 'mistake'
export type Difficulty = '基础' | '进阶' | '高频易错'
export type Category = '易望文生义' | '褒贬误用' | '对象误用' | '语法误用' | '近义混淆' | '谦敬误用' | '其他'
export interface KeyPronunciation { char: string; reading: string; note?: string }
export interface Idiom { id:string; title:string; pinyin:string; category:Category; tags:string[]; meaning:string; commonMistake:string; example:string; antiExample:string; notes:string; difficulty:Difficulty; source:string; status:IdiomStatus; isFavorite:boolean; nextReview:string; keyPronunciations?:KeyPronunciation[] }

const make = (id:string,title:string,category:Category,difficulty:Difficulty,meaning:string,commonMistake:string,example:string,antiExample:string,tags:string[],source='《现代汉语成语规范词典》常见释义') : Idiom => ({id,title,pinyin:'',category,tags,meaning,commonMistake,example,antiExample,notes:'行测高频用法，结合语境判断。',difficulty,source,status:'unlearned',isFavorite:false,nextReview:''})

// 成语标题严格来自项目根目录“工作簿1.xlsx”，不得在此添加表格之外的成语。
export const idioms: Idiom[] = [
  {...make('zuo-zhi-you-chu','左支右绌','其他','进阶','指力量不足，应付了这方面，那方面又出了问题。','误解为左右配合、从容应对。','项目同时铺开过多，有限的人手难免左支右绌。','团队资源充足，处理各项任务左支右绌。',['困窘','能力不足']),keyPronunciations:[{char:'绌',reading:'chù',note:'“绌”意为不足，读 chù。'}]},
  make('yan-bu-ji-yi','言不及义','其他','进阶','只说些无聊的话，不涉及正经道理。','误解为说话没有达到某种“义气”标准。','会议讨论应紧扣主题，切莫言不及义。','他的发言直指问题核心，可谓言不及义。',['言谈','离题']),
  {...make('ji-qu-ao-ya','佶屈聱牙','对象误用','高频易错','形容文章艰涩，读起来不顺口。','用于形容事情难办或道路崎岖。','这段文字用典过密，显得佶屈聱牙。','山路蜿蜒陡峭，十分佶屈聱牙。',['文章','艰涩']),keyPronunciations:[{char:'佶屈聱',reading:'jí qū áo',note:'三个字较生僻，依次读 jí、qū、áo。'}]},
  make('tou-shu-ji-qi','投鼠忌器','易望文生义','高频易错','想用东西打老鼠，又怕打坏旁边的器物；比喻想打击坏人而又有所顾忌。','仅按字面理解为害怕器物，或用于毫无顾忌的行动。','处理这一问题需顾及无辜者，难免投鼠忌器。','他毫无顾虑地果断出手，真是投鼠忌器。',['顾忌','望文生义']),
  make('shou-shu-liang-duan','首鼠两端','易望文生义','高频易错','在两者之间犹豫不决或动摇不定。','误解为首先出现的老鼠，或单纯指做事有两个开端。','面对两个方案，他首鼠两端，迟迟不能决定。','他态度坚定、选择明确，却被说成首鼠两端。',['犹豫','态度']),
  make('kong-gu-zu-yin','空谷足音','易望文生义','进阶','在寂静山谷听到脚步声；比喻极难得的音信、言论或事物。','仅用于描述山谷中的声音。','这份扎实的调查报告，在浮泛议论中堪称空谷足音。','山谷里传来脚步声，这就是空谷足音的全部含义。',['难得','望文生义']),
  {...make('bu-jue-ru-lv','不绝如缕','易望文生义','高频易错','像细线一样连着，差点儿就要断了；多形容局势危急或声音细微悠长。','误作连续不断、数量很多，与“络绎不绝”混用。','远处笛声不绝如缕，若有若无。','游客成群结队，不绝如缕地涌入景区。',['声音','危急','近义辨析']),keyPronunciations:[{char:'缕',reading:'lǚ',note:'“缕”指线，读 lǚ。'}]},
  make('hun-shui-mo-yu','浑水摸鱼','褒贬误用','基础','比喻趁混乱时机获取不正当利益。','误作在复杂局面中灵活解决问题的褒义表达。','有人企图借信息混乱浑水摸鱼。','他凭专业能力解决难题，可谓浑水摸鱼。',['贬义','投机']),
  make('bian-chang-mo-ji','鞭长莫及','易望文生义','基础','原意是鞭子虽长，也打不到马肚子；比喻力量达不到。','误解为鞭子不够长，或泛指时间来不及。','总部远离现场，对具体环节难免鞭长莫及。','因为出门太晚，他鞭长莫及地错过了列车。',['能力范围','望文生义']),
  make('gai-xian-geng-zhang','改弦更张','易望文生义','高频易错','改换琴弦，重新安上；比喻改革制度或变更方法。','仅理解为修理乐器，或与只改变局部做法混淆。','旧机制已不适应发展，需要改弦更张。','他给琴换了一根弦，完成了政策上的改弦更张。',['改革','方法']),
  make('ren-zhong-dao-yuan','任重道远','其他','基础','担子很重，路程很远；比喻责任重大，需要长期艰苦奋斗。','用于轻松、短期即可完成的小事。','推进基层治理现代化任重道远。','顺手关灯这件小事真是任重道远。',['责任','长期']),
  make('da-xiang-jing-ting','大相径庭','近义混淆','基础','表示彼此相差很远或矛盾很大。','误作“大同小异”，形容差别很小。','两份报告的结论大相径庭。','两个方案几乎完全一致，实在大相径庭。',['差异','比较']),
  make('nan-yi-wei-ji','难以为继','其他','基础','难以继续下去。','误解为难以把某人当作继承人。','如果长期入不敷出，项目将难以为继。','项目资金充裕、运行稳定，已经难以为继。',['持续','困境']),
  make('ying-you-zhi-yi','应有之义','其他','进阶','按道理应该包含的意义；指某事物本来就应具备的内容。','误解为“应有的义气”或额外附加的要求。','保障公平是公共服务的应有之义。','公平与公共服务毫无关系，却是它的应有之义。',['道理','内涵']),
  make('qi-tou-bing-jin','齐头并进','其他','基础','几方面不分先后地一同前进。','用于只有单一对象的行动，或误解为必须速度完全相同。','改革与治理应齐头并进。','这项唯一的任务独自齐头并进。',['并行','发展']),
]
