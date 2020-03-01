import {
  HighlightedTicketParamsState,
  HighlightedTicketParamsActions,
  ADD_HIGHLIGHTED_TICKET_PARAMS,
  REMOVE_HIGHLIGHTED_TICKET_PARAMS,
} from '../types/highlighted_ticket_params.types'

export const initialState: HighlightedTicketParamsState = null

export default function(
  state: HighlightedTicketParamsState = initialState,
  action: HighlightedTicketParamsActions,
) {
  switch (action.type) {
    case ADD_HIGHLIGHTED_TICKET_PARAMS:
      return action.params
    case REMOVE_HIGHLIGHTED_TICKET_PARAMS:
      return initialState
    default:
      return state
  }
}
