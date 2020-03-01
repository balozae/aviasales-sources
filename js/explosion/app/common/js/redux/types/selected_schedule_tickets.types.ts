import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export const UPDATE_SELECTED_SCHEDULE_TICKET = 'UPDATE_SELECTED_SCHEDULE_TICKET'
export const RESET_SELECTED_SCHEDULE_TICKET = 'RESET_SELECTED_SCHEDULE_TICKET'

export interface ScheduleTicketsIterator<T> {
  [groupKey: string]: T | undefined
}

interface UpdateSelectedScheduleTicketAction {
  type: typeof UPDATE_SELECTED_SCHEDULE_TICKET
  groupKey: string
  ticket: TicketTuple
}

interface ResetSelectedScheduleTicketAction {
  type: typeof RESET_SELECTED_SCHEDULE_TICKET
}

export type SelectedScheduleTicketsActions =
  | UpdateSelectedScheduleTicketAction
  | ResetSelectedScheduleTicketAction

export type SelectedScheduleTicketsState = {
  [groupKey: string]: TicketTuple | undefined
}
