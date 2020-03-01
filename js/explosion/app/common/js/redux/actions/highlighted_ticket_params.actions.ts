import {
  HighlightedTicketParamsActions,
  HighlightedTicketParams,
  ADD_HIGHLIGHTED_TICKET_PARAMS,
  REMOVE_HIGHLIGHTED_TICKET_PARAMS,
} from '../types/highlighted_ticket_params.types'
import { getDefaultTariffs } from 'components/request/ticket_tariffs_processor/tariffs.utils'

export const addHighlightedTicketParams = (
  params: HighlightedTicketParams,
): HighlightedTicketParamsActions => ({
  type: ADD_HIGHLIGHTED_TICKET_PARAMS,
  params: params ? { ...params, tariffs: getDefaultTariffs() } : params,
})

export const removeHighlightedTicketParams = (): HighlightedTicketParamsActions => ({
  type: REMOVE_HIGHLIGHTED_TICKET_PARAMS,
})
