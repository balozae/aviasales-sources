import { SearchParams } from 'form/components/avia_form/avia_form.types'
import { MultiwayParamsActions, UPDATE_MULTIWAY_PARAMS } from '../types/multiway_params.types'
import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import { AnyAction } from 'redux'
import { startSearch } from './start_search/start_search.actions'
import { updateAviaParams } from './avia_params.actions'
import { isOpenJaw } from '../selectors/search_params.selectors'

export const updateMultiwayParams = (params: Partial<SearchParams>): MultiwayParamsActions => ({
  type: UPDATE_MULTIWAY_PARAMS,
  params,
})

export const multiwayFormSubmit = (): ThunkAction<any, AppState, any, AnyAction> => (
  dispatch,
  getState,
) => {
  const state = getState()
  const actionUrl = state.pageHeader.tabs.multiway!.action!
  const params = state.multiwayParams

  if (!isOpenJaw(params)) {
    dispatch(updateAviaParams({ segments: params.segments }))
  }

  dispatch(startSearch(params, actionUrl, false))
}
