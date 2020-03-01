import { TopPlacementTicket } from 'components/ad_top_placement/ad_top_placement.types'

export const ADD_TOP_PLACEMENT_TICKET = 'ADD_TOP_PLACEMENT_TICKET'
export const TOP_PLACEMENT_TICKET_CLICK = 'TOP_PLACEMENT_TICKET_CLICK'
export const TOP_PLACEMENT_TICKET_SHOWN = 'TOP_PLACEMENT_TICKET_SHOWN'

export type TopPlacementTicketShownAction = {
  type: typeof TOP_PLACEMENT_TICKET_SHOWN
}

export type TopPlacementTicketClickAction = {
  type: typeof TOP_PLACEMENT_TICKET_CLICK
}

export type AddTopPlacementTicketAction = {
  type: typeof ADD_TOP_PLACEMENT_TICKET
  topPlacementTicket: TopPlacementTicket
}

export type TopPlacementTicketState = TopPlacementTicket | null

export type TopPlacementTicketActions =
  | AddTopPlacementTicketAction
  | TopPlacementTicketClickAction
  | TopPlacementTicketShownAction
