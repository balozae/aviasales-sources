import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'

export type ChangedFilter = any
export type PrecheckedFilter = any
export type FilterChangedByUser = any
export type FilterName = string
export type FilterValue = any
export type FilterField = any
export type Filter = any

export const UPDATE_FILTERS = 'UPDATE_FILTERS'
export const UPDATE_FILTER = 'UPDATE_FILTER'
export const RESET_FILTERS = 'RESET_FILTERS'
export const RESET_FILTER = 'RESET_FILTER'
export const RESET_FILTER_SUCCESS = 'RESET_FILTER_SUCCESS'
export const EXPAND_FILTER = 'EXPAND_FILTER'
export const EXPAND_FILTER_SUCCESS = 'EXPAND_FILTER_SUCCESS'
export const OPEN_FILTER = 'OPEN_FILTER'
export const CLOSE_FILTER = 'CLOSE_FILTER'
export const HIDE_FILTERS = 'HIDE_FILTERS'

export interface UpdateFilterPayload {
  filterName: FilterName
  filterValue: FilterValue
  filterField?: FilterField
}

export interface UpdateFiltersAction {
  type: typeof UPDATE_FILTERS
  filters: FiltersState
}

interface UpdateFilterAction extends UpdateFilterPayload {
  type: typeof UPDATE_FILTER
}

interface ResetFiltersAction {
  type: typeof RESET_FILTERS
}

interface ResetFilterAction {
  type: typeof RESET_FILTER
  filter: Filter
}

interface ResetFilterSuccessAction {
  type: typeof RESET_FILTER_SUCCESS
}

interface ExpandFilterAction {
  type: typeof EXPAND_FILTER
  filter: Filter
}

interface ExpandFilterSuccessAction {
  type: typeof EXPAND_FILTER_SUCCESS
}

interface OpenFilterAction {
  type: typeof OPEN_FILTER
  filter: Filter
}

interface CloseFilterAction {
  type: typeof CLOSE_FILTER
  filter: Filter
}

interface HideFiltersAction {
  type: typeof HIDE_FILTERS
}

export type FiltersActions =
  | UpdateFiltersAction
  | UpdateFilterAction
  | ResetFiltersAction
  | ResetFilterAction
  | ResetFilterSuccessAction
  | ExpandFilterAction
  | ExpandFilterSuccessAction
  | OpenFilterAction
  | CloseFilterAction
  | HideFiltersAction

export type FiltersState = {
  changedFilters: ChangedFilter[]
  precheckedFilters: PrecheckedFilter[]
  openedFilters: Filter[]
  isFiltersChangedByUser: boolean
  filtersChangedByUser: FilterChangedByUser[]
  resetFilter?: any
  expandFilter?: any
  filters?: any
  filterFunc?: (ticket: TicketTuple) => TicketTuple | null
}
