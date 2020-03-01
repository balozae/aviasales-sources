import { AppState } from '../types/root/explosion'

export const getFilters = (state: AppState) => state.filters

export const getChangedFilters = (state: AppState) => state.filters.changedFilters

export const getFiltersApplied = (state: AppState) =>
  state.filters.changedFilters && state.filters.changedFilters.length !== 0
