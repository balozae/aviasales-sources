import {
  FirstTicketArrivedAtState,
  FirstTicketArrivedAction,
  FIRST_TICKET_ARRIVED,
} from '../types/first_ticket_arrived_at.types'

export const initialState: FirstTicketArrivedAtState = null

export default function(
  state: FirstTicketArrivedAtState = initialState,
  action: FirstTicketArrivedAction,
) {
  switch (action.type) {
    case FIRST_TICKET_ARRIVED:
      return action.timestamp
    default:
      return state
  }
}
