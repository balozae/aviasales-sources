import localStorageHelper from 'common/bindings/local_storage_helper'
import {
  PrerollQuestionsState,
  PrerollQuestionsActions,
  ADD_PREROLL_QUESTIONS,
  UPDATE_PREROLL_QUESTIONS,
} from '../types/preroll_questions.types'

export const initialState: PrerollQuestionsState = null

export default function(
  state: PrerollQuestionsState = initialState,
  action: PrerollQuestionsActions,
) {
  switch (action.type) {
    case ADD_PREROLL_QUESTIONS: {
      return getUnansweredQuestions(action.prerollQuestions)
    }

    case UPDATE_PREROLL_QUESTIONS: {
      updateLocalStorage(action.question)
      const nextQuestions = getNextQuestions(state, action.question)
      if (nextQuestions != null ? nextQuestions[0] : undefined) {
        localStorageHelper.setItem('preroll_next_question_id', nextQuestions[0].id)
      }
      return nextQuestions
    }

    default:
      return state
  }
}

function getItems() {
  const questions = localStorageHelper.getJSONItem('preroll_question')
  return questions || null
}

function getUnansweredQuestions(questions?: Array<any>) {
  if (!questions) {
    return null
  }
  if (!questions.length) {
    return []
  }
  const prevQuestions = getItems()
  if (!prevQuestions) {
    return questions
  }
  return (() => {
    const result: any[] = []
    for (let question of questions) {
      if (!~prevQuestions.ids.indexOf(question.id)) {
        result.push(question)
      }
    }
    return result
  })()
}

function updateLocalStorage(question) {
  const userQuestions = getItems() || { ids: [] }
  if (!~userQuestions.ids.indexOf(question.id)) {
    userQuestions.ids.push(question.id)
  }
  return localStorageHelper.setJSONItem('preroll_question', userQuestions)
}

function getNextQuestions(questions, answeredQuestion) {
  return questions.filter((question) => question.id !== answeredQuestion.id)
}
