export const FIRST_TICKET_ARRIVED = 'FIRST_TICKET_ARRIVED'

export type FirstTicketArrivedAction = {
  type: typeof FIRST_TICKET_ARRIVED
  timestamp: number
}

export type FirstTicketArrivedAtState = Date | null
