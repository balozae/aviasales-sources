import { ThunkAction } from 'redux-thunk'
import { AnyAction } from 'redux'
import { SearchParams } from 'form/components/avia_form/avia_form.types'
import { AppState } from '../../types/root/explosion'
import { openInNewTab } from './start_search.utils'
import { openHotelsWindow } from './open_hotels_window.actions'

export const startSearchWithHotels = (
  params: SearchParams,
  fullUrl: string,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()

  const isMainPage = state.currentPage === 'main'

  if (window.IntentMedia && isMainPage) {
    window.IntentMedia.trigger('redirect_to_exit_unit')
  }

  openInNewTab(fullUrl, /http(|s)/.test(fullUrl))
  dispatch(openHotelsWindow(params))
}
