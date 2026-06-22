import type { Idiom, IdiomStatus } from './data/idioms'
export interface LearningRecord { status: IdiomStatus; isFavorite: boolean; nextReview: string }
const KEY='xingce-idiom-progress-v1'
export const getRecords=():Record<string,LearningRecord>=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export const getRecord=(idiom:Idiom):LearningRecord=>getRecords()[idiom.id]||{status:idiom.status,isFavorite:idiom.isFavorite,nextReview:idiom.nextReview}
export const saveRecord=(id:string,patch:Partial<LearningRecord>)=>{const all=getRecords();const current=all[id]||{status:'unlearned' as const,isFavorite:false,nextReview:''};all[id]={...current,...patch};localStorage.setItem(KEY,JSON.stringify(all));window.dispatchEvent(new Event('idiom-progress'))}
