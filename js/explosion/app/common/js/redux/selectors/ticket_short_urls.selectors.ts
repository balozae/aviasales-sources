import { AppState } from '../types/root/explosion'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const getTicketShortUrl = (state: AppState, ticket: TicketTuple): string | undefined =>
  state.ticketShortUrls[ticket[0].sign]
