import {
  TopPlacementTicketActions,
  TOP_PLACEMENT_TICKET_CLICK,
  TOP_PLACEMENT_TICKET_SHOWN,
} from '../types/top_placement_ticket.types'

export const topPlacementTicketShown = (): TopPlacementTicketActions => ({
  type: TOP_PLACEMENT_TICKET_SHOWN,
})

export const topPlacementTicketClick = (): TopPlacementTicketActions => ({
  type: TOP_PLACEMENT_TICKET_CLICK,
})
