import { PrerollQuestionsActions, UPDATE_PREROLL_QUESTIONS } from '../types/preroll_questions.types'

export const updatePrerollQuestions = ({ question, answer }): PrerollQuestionsActions => ({
  type: UPDATE_PREROLL_QUESTIONS,
  question,
  // answer,
})
