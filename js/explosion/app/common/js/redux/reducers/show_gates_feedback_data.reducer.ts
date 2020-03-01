import {
  ShowGatesFeedbackDataState,
  UpdateShowGatesFeedbackDataAction,
} from '../types/show_gates_feedback_data.types'

export const initialState: ShowGatesFeedbackDataState = Object.freeze({
  isShowForAll: false,
  gateIds: [],
})

export default function(
  state: ShowGatesFeedbackDataState = initialState,
  action: UpdateShowGatesFeedbackDataAction,
) {
  switch (action.type) {
    case 'UPDATE_SHOW_GATES_FEEDBACK_DATA':
      return action.showGatesFeedbackData
    default:
      return state
  }
}
