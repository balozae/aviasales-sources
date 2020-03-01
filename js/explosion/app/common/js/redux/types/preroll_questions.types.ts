export const ADD_PREROLL_QUESTIONS = 'ADD_PREROLL_QUESTIONS'
export const UPDATE_PREROLL_QUESTIONS = 'UPDATE_PREROLL_QUESTIONS'

interface AddPrerollQuestionsAction {
  type: typeof ADD_PREROLL_QUESTIONS
  prerollQuestions: any
}

interface UpdatePrerollQuestionsAction {
  type: typeof UPDATE_PREROLL_QUESTIONS
  question: any
}

export type PrerollQuestionsActions = AddPrerollQuestionsAction | UpdatePrerollQuestionsAction

export type PrerollQuestionsState = { [key: string]: any } | null
