import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import rollbar from 'common/utils/rollbar'
import { SearchParams } from 'form/components/avia_form/avia_form.types'
import { AppState } from '../../types/root/explosion'
import { isValidParams, setSearchCookies } from './start_search.utils'
import { isOpenSearch } from 'form/components/avia_form/utils'
import { startOpenSearch } from './start_open_search.actions'
import { startSPASearch } from './start_spa_search.actions'
import parseUrl from 'common/utils/short_url_parser'
import TripParams from 'utils/trip_params.coffee'
import { getUrlAction } from 'common/utils/short_url_regex'
import { currentSearchFormParamsSelector } from '../../selectors/search_params.selectors'
import { startExternalSearch } from './start_external_search.actions'
import { startSearchWithHotels } from './start_search_with_hotels.actions'
import { batchActions } from 'redux-batched-actions'
import { updateSearchStatus } from '../search_status.actions'
import { SearchStatus } from 'common/base_types'
import { updateAviaParams } from '../avia_params.actions'
import { updateMultiwayParams } from '../multiway_params.actions'
import { updateRequestId } from '../request_id.actions'
const searchUrl = require('common/utils/search_url')

const DEFAULT_ACTION_URL = '/search'

/**
 * Main startSearch action. Use only this action to start a search.
 * Do not use another start search actions directly
 * @param params
 * @param actionUrl
 * @param shouldSearchHotels
 */
export const startSearch = (
  params: SearchParams,
  actionUrl: string = DEFAULT_ACTION_URL,
  shouldSearchHotels: boolean = false,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  if (!isValidParams(params)) {
    rollbar.info("Bad search params. Can't start search", params)
    return
  }

  if (isOpenSearch(params.segments)) {
    return dispatch(startOpenSearch(params))
  }

  const url = searchUrl(params)
  const fullUrl = actionUrl + url
  setSearchCookies(url, params)

  if (actionUrl !== DEFAULT_ACTION_URL) {
    return dispatch(startExternalSearch(params, fullUrl, shouldSearchHotels))
  }

  if (shouldSearchHotels) {
    return dispatch(startSearchWithHotels(params, fullUrl))
  }

  // NOTE: SPA mode
  dispatch(startSPASearch(params, fullUrl))
}

export const startSearchFromStandaloneNodes = (
  params: SearchParams,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch, getState) => {
  const state = getState()
  const aviaFormActionUrl = state.pageHeader.tabs.avia!.action!
  dispatch(startSearch(params, aviaFormActionUrl))
}

export const startSearchBySearchLinkClick = (
  url: string,
): ThunkAction<any, AppState, void, AnyAction> => (dispatch) => {
  const params = parseUrl(url)
  const actionUrl = getUrlAction(url)
  dispatch(
    startSearch(
      {
        ...params,
        segments: TripParams.castSegments(params),
        tripClass: params.trip_class,
      },
      actionUrl,
    ),
  )
}

export const restartSearch = (): ThunkAction<any, AppState, void, AnyAction> => (
  dispatch,
  getState,
) => {
  const state = getState()
  const formParams = currentSearchFormParamsSelector(state)
  dispatch(startSearch(formParams))
}

export const clearSearch = (): ThunkAction<any, AppState, void, AnyAction> => (dispatch) => {
  dispatch(
    batchActions([
      updateRequestId(null),
      updateSearchStatus(SearchStatus.Finished),
      updateAviaParams({ startSearch: false }),
      updateMultiwayParams({ startSearch: false }),
    ]),
  )
}
