import { TicketTuple } from '../ticket_incoming_data.types'
import { TicketScheduleProps } from '../ticket_schedule/ticket_schedule'

export const prepareTicketSchedule = (
  scheduleTickets: ReadonlyArray<TicketTuple>,
): TicketScheduleProps['schedule'] =>
  scheduleTickets.map(([ticket, proposals]) => ({
    time: ticket.segments_time[0],
    unifiedPrice: proposals[0].unified_price,
    sign: ticket.sign,
  }))
