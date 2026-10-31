import { concepts } from './syllabus.js'
import { misconceptions } from './misconceptions.js'
import { questions } from './questions.js'

export { concepts, misconceptions, questions }
export const getConcept = (id: string) => concepts.find((concept) => concept.id === id)
export const getQuestion = (id: string) => questions.find((question) => question.id === id)
export const getPrerequisites = (conceptId: string) => getConcept(conceptId)?.prerequisites ?? []
export const getQuestionsForConcept = (conceptId: string) => questions.filter((question) => question.conceptIds.includes(conceptId))
