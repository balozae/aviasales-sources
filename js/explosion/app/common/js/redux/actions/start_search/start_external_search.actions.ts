import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { SearchParams } from 'form/components/avia_form/avia_form.types'
import { AppState } from '../../types/root/explosion'
import { openInNewTab } from './start_search.utils'
import { openHotelsWindow } from './open_hotels_window.actions'

export const startExternalSearch = (
  params: SearchParams,
  fullUrl: string,
  shouldSearchHotels: boolean,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()

  const isMainPage = state.currentPage === 'main'

  if (window.IntentMedia && isMainPage) {
    window.IntentMedia.trigger('redirect_to_exit_unit')
  }

  if (!shouldSearchHotels) {
    window.location.assign(fullUrl)
    return
  }

  openInNewTab(fullUrl, /http(|s)/.test(fullUrl))
  dispatch(openHotelsWindow(params))
}
