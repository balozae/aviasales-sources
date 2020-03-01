import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { parse as parseDate } from 'finity-js'
import { Location, Action } from 'history'
import { MobileTicketModalType } from 'shared_components/ticket/ticket.mobile'
import { AppState } from '../types/root/explosion'
import {
  BrowserHistoryStateItem,
  UPDATE_BROWSER_HISTORY,
  UpdateBrowserHistoryAction,
  HistoryItemState,
  SearchStateItem,
  TicketModalStateItem,
  BrowserHistoryActions,
} from '../types/browser_history.types'
import { SearchParams, SearchParamsInHistory } from 'form/components/avia_form/avia_form.types'
import { historyAPI } from 'form/history_api'
import rollbar from 'common/utils/rollbar'
import { expandTicket, collapseTicket } from './ticket.actions'
import { parsePathnameAndUpdateCurrentPage } from './current_page.actions'
import { startSearch, clearSearch } from './start_search/start_search.actions'
import { TicketData } from 'shared_components/ticket/ticket_incoming_data.types'

const searchUrl = require('common/utils/search_url')

export const updateBrowserHistoryState: ActionCreator<UpdateBrowserHistoryAction> = (
  data: BrowserHistoryStateItem,
): UpdateBrowserHistoryAction => {
  return {
    type: UPDATE_BROWSER_HISTORY,
    data,
  }
}

export const updateBrowserHistory = (
  location: Location<HistoryItemState>,
  action: Action,
): ThunkAction<any, AppState, void, BrowserHistoryActions> => (dispatch) => {
  if (action === 'POP') {
    dispatch(browserHistoryPopState(location))
  }
  dispatch(
    updateBrowserHistoryState({
      data: location.state,
      action,
    }),
  )
  dispatch(parsePathnameAndUpdateCurrentPage())
}

export const browserHistoryPopState = (
  location: Location<HistoryItemState>,
): ThunkAction<any, AppState, void, BrowserHistoryActions> => (dispatch) => {
  window.isSearchPage = location.pathname.indexOf('/search') === 0
  if (window.isSearchPage) {
    dispatch(restoreSearchFromHistory(location))
  } else {
    dispatch(clearSearch())
  }
}

export const openHistoryModal = (
  ticketIndex: number,
  ticketData: TicketData,
  modal: MobileTicketModalType,
): ThunkAction<any, AppState, void, BrowserHistoryActions> => (dispatch, getState) => {
  const { browserHistory } = getState()
  const prevState = browserHistory[browserHistory.length - 1].data as TicketModalStateItem
  historyAPI.push({ state: { type: 'ticketModal', modal, ticketSign: ticketData.sign } })
  if (modal === 'mainModal' && prevState && !prevState.modal) {
    dispatch(expandTicket(ticketIndex, ticketData))
  }
}

export const closeHistoryModal = (
  ticketIndex: number,
  ticketSign: string,
  modal: MobileTicketModalType,
): ThunkAction<any, AppState, void, BrowserHistoryActions> => (dispatch) => {
  historyAPI.goBack()
  if (modal === 'mainModal') {
    dispatch(collapseTicket(ticketIndex, ticketSign))
  }
}

export const restoreSearchFromHistory = (
  location: Location<HistoryItemState>,
): ThunkAction<any, AppState, void, BrowserHistoryActions> => (dispatch, getState) => {
  try {
    const state = getState()
    const { browserHistory } = state
    const historyState = location.state as SearchStateItem
    const prevState = browserHistory[browserHistory.length - 1].data as SearchStateItem
    const isPrevIsSeach = !!(prevState && prevState.type === 'search')
    const isPrevIsContentPage = !prevState
    const isCurrentIsSearch = historyState && historyState.type === 'search'
    if (isCurrentIsSearch && (isPrevIsSeach || isPrevIsContentPage)) {
      const newParams = parseSearchParamsFromHistory(historyState.params)
      const prevParams = isPrevIsSeach && parseSearchParamsFromHistory(prevState!.params)
      const shortUrl = searchUrl(newParams) as string
      const prevShortUrl = prevParams && (searchUrl(prevParams) as string)
      if (shortUrl !== prevShortUrl) {
        dispatch(startSearch(newParams))
      }
    }
  } catch (err) {
    rollbar.error('Could not start search by pop state', err)
  }
}

const parseSearchParamsFromHistory = (params: SearchParamsInHistory): SearchParams => {
  if (!params || !params.segments) {
    return params as SearchParams
  }

  const newSegments = params.segments.map((segment) => {
    let newDate: any = segment.date
    if (segment.date && typeof segment.date === 'string') {
      newDate = parseDate(segment.date, 'YYYY-MM-DD')
    }

    return {
      ...segment,
      date: newDate,
    }
  })
  return {
    ...params,
    segments: newSegments,
  } as SearchParams
}
