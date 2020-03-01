import { SearchParams } from 'shared_components/ticket/ticket.types'
import { CurrencyActions } from './currency.types'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { SortState } from './sort.types'
import { PopularFilters } from './popular_filters.types'

export const UPDATE_SEARCH_DATA = 'UPDATE_SEARCH_DATA'
export const UPDATE_SEARCH_PARAMS = 'UPDATE_SEARCH_PARAMS'

export interface SearchDataActionPayload {
  tickets: TicketTuple[]
  segments: any
  market: any
  sort: SortState
  airlines: any
  airlineRules: any
  airlineFeatures: any
  tariffMapping: any
  popularFilters: PopularFilters
}
export interface SearchParamsActionPayload {
  params: any
  request_id: string
}

interface UpdateSearchDataAction extends Partial<SearchDataActionPayload> {
  type: typeof UPDATE_SEARCH_DATA
}

interface UpdateSearchParamsAction {
  type: typeof UPDATE_SEARCH_PARAMS
  data: SearchParamsActionPayload
}

export type SearchParamsActions =
  | UpdateSearchDataAction
  | UpdateSearchParamsAction
  | CurrencyActions

export type SearchParamsState = SearchParams | null
