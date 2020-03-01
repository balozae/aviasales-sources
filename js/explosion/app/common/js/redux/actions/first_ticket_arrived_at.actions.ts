import {
  FirstTicketArrivedAction,
  FIRST_TICKET_ARRIVED,
} from '../types/first_ticket_arrived_at.types'

export const firstTicketArrived = (): FirstTicketArrivedAction => ({
  type: FIRST_TICKET_ARRIVED,
  timestamp: Date.now(),
})
