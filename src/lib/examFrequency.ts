import type { Idiom } from '../types/database'

const frequencyPattern = /国省考检索频率：(\d+)/

export function getExamFrequency(idiom: Pick<Idiom, 'source'>) {
  const match = idiom.source?.match(frequencyPattern)
  return match ? Number(match[1]) : 0
}

export function getExamFrequencyLabel(idiom: Pick<Idiom, 'source'>) {
  const value = getExamFrequency(idiom)
  return value > 0 ? `考频 ${value}` : ''
}
