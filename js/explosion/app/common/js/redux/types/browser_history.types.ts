import { SearchParamsInHistory } from 'form/components/avia_form/avia_form.types'
import { MobileTicketModalType } from 'shared_components/ticket/ticket.mobile'
import { Action } from 'history'

export const UPDATE_BROWSER_HISTORY = 'UPDATE_BROWSER_HISTORY'

export type SearchStateItem = {
  type: 'search'
  params: SearchParamsInHistory
}

export type TicketModalStateItem = {
  type: 'ticketModal'
  modal: MobileTicketModalType
  ticketSign: string
}

export type DatePickerModal = {
  type: 'datepickerModal'
  activeInput?: 'departure' | 'return'
}

export type HistoryItemState = SearchStateItem | TicketModalStateItem | DatePickerModal

export type BrowserHistoryStateItem = {
  data: HistoryItemState
  action: Action
}

export interface UpdateBrowserHistoryAction {
  type: typeof UPDATE_BROWSER_HISTORY
  data: BrowserHistoryStateItem
}

export type BrowserHistoryActions = UpdateBrowserHistoryAction

export type BrowserHistoryState = BrowserHistoryStateItem[]
