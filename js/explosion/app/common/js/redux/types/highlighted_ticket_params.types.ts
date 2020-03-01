import { Tariffs } from 'shared_components/types/tariffs'

export interface HighlightedTicketParams {
  price?: number
  reachGoalData?: any
  tariffs?: Tariffs
  sign: string
  footprintOld?: string
}

export const ADD_HIGHLIGHTED_TICKET_PARAMS = 'ADD_HIGHLIGHTED_TICKET_PARAMS'
export const REMOVE_HIGHLIGHTED_TICKET_PARAMS = 'REMOVE_HIGHLIGHTED_TICKET_PARAMS'

interface AddHighlightedTicketParamsAction {
  type: typeof ADD_HIGHLIGHTED_TICKET_PARAMS
  params: HighlightedTicketParams
}

interface RemoveHighlightedTicketParamsAction {
  type: typeof REMOVE_HIGHLIGHTED_TICKET_PARAMS
}

export type HighlightedTicketParamsActions =
  | AddHighlightedTicketParamsAction
  | RemoveHighlightedTicketParamsAction

export type HighlightedTicketParamsState = HighlightedTicketParams | null
