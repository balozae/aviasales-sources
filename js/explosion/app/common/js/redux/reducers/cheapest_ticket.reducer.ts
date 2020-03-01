import {
  CheapestTicketState,
  CheapestTicketActions,
  UPDATE_CHEAPEST_TICKET,
} from '../types/cheapest_ticket.types'

export const initialState: CheapestTicketState = null

export default function(state: CheapestTicketState = initialState, action: CheapestTicketActions) {
  switch (action.type) {
    case UPDATE_CHEAPEST_TICKET:
      return action.ticket
    default:
      return state
  }
}
