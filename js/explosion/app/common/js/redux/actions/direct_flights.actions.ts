import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { DateType } from 'form/components/avia_form/avia_form.types'
import { updateSegmentDate } from 'form/components/avia_form/utils'
import { AppState } from '../types/root/explosion'
import { startSearch } from './start_search/start_search.actions'
import { reachGoal } from './metrics.actions'
import { currentSearchFormParamsSelector } from '../selectors/search_params.selectors'

export const directFlightsSearchClick = (
  departDate: Date,
  returnDate: Date,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()

  const formParams = currentSearchFormParamsSelector(state)

  let segments = updateSegmentDate(DateType.DepartDate, departDate, formParams.segments)
  if (returnDate) {
    segments = updateSegmentDate(DateType.ReturnDate, returnDate, segments)
  }

  dispatch(reachGoal('DIRECT_FLIGHTS_FIND_BUTTON_CLICK'))
  dispatch(startSearch({ ...formParams, segments }))
}

export const directFlightsDayClick = (): ThunkAction<any, AppState, any, AnyAction> => (
  dispatch,
) => {
  dispatch(reachGoal('DIRECT_FLIGHTS_DATE_CLICK'))
}
