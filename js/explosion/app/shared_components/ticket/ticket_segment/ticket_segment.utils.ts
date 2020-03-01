import { TicketSegment } from '../ticket.types'
import { TicketData, Flight } from '../ticket_incoming_data.types'
import { getTripTransportType } from '../utils/ticket_common.utils'

export const prepareTicketSegments = (ticketData: TicketData): TicketSegment[] =>
  ticketData.segment.map((segment) => ({
    route: segment.flight.map((flight: Flight) => {
      return { ...flight, transport: getTripTransportType(flight) }
    }),
    transfers: segment.transfers,
  }))
