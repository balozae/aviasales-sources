import {
  SearchParamsActions,
  SearchDataActionPayload,
  UPDATE_SEARCH_DATA,
  UPDATE_SEARCH_PARAMS,
  SearchParamsActionPayload,
} from '../types/search_params.types'
import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import { firstTicketArrived } from './first_ticket_arrived_at.actions'
import { FirstTicketArrivedAction } from '../types/first_ticket_arrived_at.types'

export const updateSearchData = (
  data: Partial<SearchDataActionPayload>,
): ThunkAction<any, AppState, any, SearchParamsActions | FirstTicketArrivedAction> => (
  dispatch,
  getState,
) => {
  const state = getState()
  const actionPayload = { ...data }
  if (data.tickets && data.tickets.length > 0) {
    if (state.tickets.length === 0) {
      dispatch(firstTicketArrived())
    }
    actionPayload.sort = state.sort
  }
  dispatch({ ...actionPayload, type: UPDATE_SEARCH_DATA })
}

export const updateSearchParams = (data: SearchParamsActionPayload): SearchParamsActions => ({
  type: UPDATE_SEARCH_PARAMS,
  data,
})
