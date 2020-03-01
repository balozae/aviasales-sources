import {
  FiltersActions,
  UPDATE_FILTERS,
  FiltersState,
  FilterName,
  UPDATE_FILTER,
  RESET_FILTER,
  RESET_FILTERS,
  EXPAND_FILTER,
  OPEN_FILTER,
  CLOSE_FILTER,
  UpdateFilterPayload,
  HIDE_FILTERS,
} from '../types/filters.types'

export const updateFilters = (data: FiltersState): FiltersActions => ({
  type: UPDATE_FILTERS,
  filters: data,
})

export const updateFilter = (data: UpdateFilterPayload): FiltersActions => ({
  type: UPDATE_FILTER,
  ...data,
})

export const resetFilter = (filter: FilterName): FiltersActions => ({ type: RESET_FILTER, filter })

export const resetFilters = (): FiltersActions => ({ type: RESET_FILTERS })

export const expandFilter = (filter: FilterName): FiltersActions => ({
  type: EXPAND_FILTER,
  filter,
})

export const openFilter = (filter: FilterName): FiltersActions => ({
  type: OPEN_FILTER,
  filter,
})

export const closeFilter = (filter: FilterName): FiltersActions => ({ type: CLOSE_FILTER, filter })

export const hideFilters = (): FiltersActions => ({ type: HIDE_FILTERS })
