import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const UPDATE_CHEAPEST_TICKET = 'UPDATE_CHEAPEST_TICKET'

interface UpdateCheapestTicketAction {
  type: typeof UPDATE_CHEAPEST_TICKET
  ticket: TicketTuple | null
}

export type CheapestTicketActions = UpdateCheapestTicketAction

export type CheapestTicketState = TicketTuple | null
