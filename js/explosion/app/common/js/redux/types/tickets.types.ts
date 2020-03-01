import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const UPDATE_TICKETS = 'UPDATE_TICKETS'
export const UPDATE_SORT = 'UPDATE_SORT'
export const RESET_TICKETS = 'RESET_TICKETS'

export interface UpdateTicketsAction {
  type: typeof UPDATE_TICKETS
  tickets?: TicketTuple[]
  sort: string
}

interface UpdateSortAction {
  type: typeof UPDATE_SORT
  tickets?: TicketTuple[]
  sort: string
}

interface ResetTicketsAction {
  type: typeof RESET_TICKETS
}

export type TicketsActions = UpdateTicketsAction | UpdateSortAction | ResetTicketsAction

export type TicketsState = TicketTuple[]
