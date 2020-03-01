import { createBrowserHistory } from 'history'
import { HistoryItemState } from 'common/js/redux/types/browser_history.types'

export const historyAPI = createBrowserHistory<HistoryItemState>()
