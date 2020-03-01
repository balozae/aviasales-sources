import {
  SelectedScheduleTicketsActions,
  UPDATE_SELECTED_SCHEDULE_TICKET,
  RESET_SELECTED_SCHEDULE_TICKET,
} from '../types/selected_schedule_tickets.types'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const updateSelectedScheduleTicket = (
  groupKey: string,
  ticket: TicketTuple,
): SelectedScheduleTicketsActions => ({
  type: UPDATE_SELECTED_SCHEDULE_TICKET,
  groupKey,
  ticket,
})

export const resetSelectedScheduleTicket = (): SelectedScheduleTicketsActions => ({
  type: RESET_SELECTED_SCHEDULE_TICKET,
})
