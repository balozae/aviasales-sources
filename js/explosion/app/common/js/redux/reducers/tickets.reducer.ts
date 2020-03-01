import { TicketsActions, UPDATE_TICKETS, RESET_TICKETS, TicketsState } from '../types/tickets.types'
import { UPDATE_SEARCH_DATA, SearchParamsActions } from '../types/search_params.types'

export const initialState: TicketsState = []

export default function(
  state: TicketsState = initialState,
  action: SearchParamsActions | TicketsActions,
) {
  switch (action.type) {
    case UPDATE_SEARCH_DATA:
      if (!action.tickets) {
        return state
      }
      return action.tickets
    case UPDATE_TICKETS:
      if (!action.tickets) {
        return state
      }
      return action.tickets
    case RESET_TICKETS:
      return []
    default:
      return state
  }
}
