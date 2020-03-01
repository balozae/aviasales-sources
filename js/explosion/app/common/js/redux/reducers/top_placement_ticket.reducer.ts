import {
  TopPlacementTicketState,
  AddTopPlacementTicketAction,
  ADD_TOP_PLACEMENT_TICKET,
} from '../types/top_placement_ticket.types'

export const initialState: TopPlacementTicketState = null

export default function(
  state: TopPlacementTicketState = initialState,
  action: AddTopPlacementTicketAction,
) {
  switch (action.type) {
    case ADD_TOP_PLACEMENT_TICKET:
      return action.topPlacementTicket
    default:
      return state
  }
}
