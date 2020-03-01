import {
  SelectedScheduleTicketsState,
  SelectedScheduleTicketsActions,
  UPDATE_SELECTED_SCHEDULE_TICKET,
  RESET_SELECTED_SCHEDULE_TICKET,
} from '../types/selected_schedule_tickets.types'

export const initialState: SelectedScheduleTicketsState = Object.freeze({})

export default (
  state: SelectedScheduleTicketsState = initialState,
  action: SelectedScheduleTicketsActions,
) => {
  switch (action.type) {
    case UPDATE_SELECTED_SCHEDULE_TICKET:
      return { ...state, [action.groupKey]: action.ticket }
    case RESET_SELECTED_SCHEDULE_TICKET:
      return initialState
    default:
      return state
  }
}
