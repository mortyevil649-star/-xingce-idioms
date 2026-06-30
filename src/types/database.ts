export type StudyStatus = '未学' | '已掌握' | '易错'
export type Difficulty = '基础' | '进阶' | '高频易错'
export type ProfileRole = 'user' | 'admin'
export type IdiomRelationType = 'confusion' | 'synonym' | 'antonym' | 'related'

export interface IdiomExample {
  id: string
  idiom_id: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Idiom {
  id: string
  code: string
  title: string
  key_pronunciations: string | null
  pronunciation_note: string | null
  category: string
  tags: string[]
  meaning: string
  common_mistake: string | null
  applicable_objects: string | null
  common_collocations: string[]
  usage_restrictions: string | null
  difficulty: Difficulty
  source: string | null
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
  idiom_examples?: IdiomExample[]
}

export interface IdiomRelation {
  id: string
  source_id: string
  target_id: string | null
  target_term_id: string | null
  relation_type: IdiomRelationType
  comparison_note: string
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
  target_term?: IdiomRelationTerm | null
}

export interface IdiomRelationTerm {
  id: string
  title: string
  key_pronunciations: string | null
  meaning: string | null
  source: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface StudyRecord {
  id: string
  user_id: string
  idiom_id: string
  status: StudyStatus
  is_favorite: boolean
  personal_note: string
  personal_mistake_reminder: string
  next_review: string | null
  created_at: string
  updated_at: string
}

export interface UserIdiomExample {
  id: string
  user_id: string
  idiom_id: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  role: ProfileRole
  created_at: string
  updated_at: string
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile, { id: string; role?: ProfileRole }, { role?: ProfileRole }>
      idioms: Table<Idiom, Omit<Idiom, 'id' | 'created_at' | 'updated_at' | 'idiom_examples'> & { id?: string }, Partial<Omit<Idiom, 'idiom_examples'>>>
      idiom_examples: Table<IdiomExample, Omit<IdiomExample, 'id' | 'created_at' | 'updated_at'> & { id?: string }, Partial<IdiomExample>>
      idiom_relation_terms: Table<IdiomRelationTerm, Omit<IdiomRelationTerm, 'id' | 'created_at' | 'updated_at'> & { id?: string }, Partial<IdiomRelationTerm>>
      idiom_relations: Table<IdiomRelation, Omit<IdiomRelation, 'id' | 'created_at' | 'updated_at' | 'target_term'> & { id?: string }, Partial<Omit<IdiomRelation, 'target_term'>>>
      user_idiom_study: Table<StudyRecord, Omit<StudyRecord, 'id' | 'created_at' | 'updated_at'> & { id?: string }, Partial<StudyRecord>>
      user_idiom_examples: Table<UserIdiomExample, Omit<UserIdiomExample, 'id' | 'created_at' | 'updated_at'> & { id?: string }, Partial<UserIdiomExample>>
    }
    Views: Record<string, never>
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
