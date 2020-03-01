import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { AppState } from '../types/root/explosion'
import { startSearch } from './start_search/start_search.actions'
import { AviaParamsState, AviaParamsActions, UPDATE_AVIA_PARAMS } from '../types/avia_params.types'
import { CurrentPageState } from '../types/current_page.types'
import defaultResizer from 'shared_components/resizer'

export const updateAviaParams = (params: Partial<AviaParamsState>): AviaParamsActions => ({
  type: UPDATE_AVIA_PARAMS,
  params,
})

const mediaQueryModesMapping = {
  mobile: 'mobile',
  mobileLandscape: 'mobile',
  tablet: 'desktop',
  desktop: 'desktop',
}

export const aviaFormSubmit = (
  shouldSearchHotelsCheckbox: boolean,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()
  const actionUrl = state.pageHeader.tabs.avia!.action!
  const params = state.aviaParams
  const currentPage = state.currentPage
  const allowedHotelsSearchPages: ReadonlyArray<CurrentPageState> = ['main', 'content']
  const mediaQueryType = mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop']
  const shouldSearchHotels =
    allowedHotelsSearchPages.includes(currentPage) &&
    shouldSearchHotelsCheckbox &&
    mediaQueryType === 'desktop'

  dispatch(startSearch(params, actionUrl, shouldSearchHotels))
}
