import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { AppState } from '../types/root/explosion'
import { reachGoal } from './metrics.actions'
import { TripClass } from 'common/types'
import { startSearch } from './start_search/start_search.actions'
import { currentSearchFormParamsSelector } from '../selectors/search_params.selectors'

export const tripClassInformerShow = (): ThunkAction<any, AppState, void, AnyAction> => (
  dispatch,
) => {
  dispatch(reachGoal('TRIP_CLASSES_INFORMER_IS_SHOWN'))
}

export const emptyTicketsInformerShow = (): ThunkAction<any, AppState, void, AnyAction> => (
  dispatch,
) => {
  dispatch(reachGoal('NO_TICKETS_RECEIVED', { referrer: document.referrer }))
}

export const onChangeTripClass = (
  tripClass: TripClass,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch, getState) => {
  const state = getState()

  const formParams = currentSearchFormParamsSelector(state)

  dispatch(reachGoal('START_SEARCH_FROM_INFORMER', { trip_class: tripClass }))
  dispatch(startSearch({ ...formParams, tripClass }))
}
