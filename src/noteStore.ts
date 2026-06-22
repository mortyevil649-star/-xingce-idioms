export interface PersonalExample { id: string; text: string }
export interface PersonalNote {
  remark: string
  examples: PersonalExample[]
  mistakeReminder: string
}

const NOTE_KEY = 'xingce-idiom-personal-notes-v1'
export const emptyPersonalNote = (): PersonalNote => ({ remark: '', examples: [], mistakeReminder: '' })

const getAllNotes = (): Record<string, PersonalNote> => {
  try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}') }
  catch { return {} }
}

export const getPersonalNote = (idiomId: string): PersonalNote => {
  const note = getAllNotes()[idiomId]
  return note ? { ...note, examples: note.examples || [] } : emptyPersonalNote()
}

export const hasPersonalNote = (idiomId: string): boolean => {
  const note = getAllNotes()[idiomId]
  return Boolean(note && (note.remark.trim() || note.mistakeReminder.trim() || note.examples.some(example => example.text.trim())))
}

export const savePersonalNote = (idiomId: string, note: PersonalNote) => {
  const all = getAllNotes()
  all[idiomId] = { ...note, examples: note.examples.filter(example => example.text.trim()) }
  localStorage.setItem(NOTE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('idiom-notes'))
}

export const clearPersonalNote = (idiomId: string) => {
  const all = getAllNotes()
  delete all[idiomId]
  localStorage.setItem(NOTE_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('idiom-notes'))
}
