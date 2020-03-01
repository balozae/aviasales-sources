import guestia from 'guestia/client'
import { UPDATE_SEARCH_HISTORY, SearchHistoryActions } from '../types/search_history.types'
import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import { AnyAction } from 'redux'

const updateSearchHistory = (searches): SearchHistoryActions => ({
  type: UPDATE_SEARCH_HISTORY,
  searches,
})

export const fetchSearchHistory = (): ThunkAction<any, AppState, void, AnyAction> => async (
  dispatch,
) => {
  try {
    const { searches } = await guestia.fetchSearches()
    dispatch(updateSearchHistory(searches))
  } catch {
    // Okay, man
  }
}
