import { AppState } from '../types/root/explosion'
import { SearchStatus } from 'common/base_types'
import { createSelector } from 'reselect'
import { getFiltersApplied } from './filters.selectors'

export const getSearchId = (state: AppState) => state.searchId

export const getSearchStatus = (state: AppState) => state.searchStatus

export const getSearchFinished = (state: AppState) => {
  const status = getSearchStatus(state)
  return status === SearchStatus.Finished || status === SearchStatus.Expired
}

export const getPassengers = (state: AppState) =>
  state.searchParams && state.searchParams.passengers

export const getPassengersAmount = createSelector(
  getPassengers,
  (passengers): number => {
    if (!passengers) {
      return 0
    }
    return Object.keys(passengers).reduce((acc, key) => {
      const value = passengers[key]
      return acc + value
    }, 0)
  },
)

export const getBuyClickSearchEventData = createSelector(
  getSearchFinished,
  getFiltersApplied,
  getPassengersAmount,
  (searchFinished, filtersApplied, passengersAmount) => ({
    search_finished: searchFinished,
    filters_applied: filtersApplied,
    passengers_amount: passengersAmount,
  }),
)

export const getFirstTicketArrivedAt = (state: AppState) => state.firstTicketArrivedAt
