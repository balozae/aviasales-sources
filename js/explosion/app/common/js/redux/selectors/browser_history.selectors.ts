import { createSelector } from 'reselect'
import { AppState } from '../types/root/explosion'
import { BrowserHistoryState, BrowserHistoryStateItem } from '../types/browser_history.types'

const getBrowserHistory = (state: AppState) => state.browserHistory

const getCurrentHistoryItem = createSelector(
  getBrowserHistory,
  (historyList: BrowserHistoryState) => historyList[historyList.length - 1],
)

const getModalState = (historyItem: BrowserHistoryStateItem) =>
  (historyItem.data && historyItem.data.type === 'ticketModal' && historyItem.data) || undefined

export const getCurrentMobileModal = createSelector(getCurrentHistoryItem, getModalState)
