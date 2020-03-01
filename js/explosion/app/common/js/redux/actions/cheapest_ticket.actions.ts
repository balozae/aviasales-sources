import {
  CheapestTicketState,
  CheapestTicketActions,
  UPDATE_CHEAPEST_TICKET,
} from '../types/cheapest_ticket.types'

export const updateCheapestTicket = (ticket: CheapestTicketState): CheapestTicketActions => ({
  type: UPDATE_CHEAPEST_TICKET,
  ticket,
})
