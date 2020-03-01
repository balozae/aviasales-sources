export const UPDATE_CURRENT_PAGE = 'UPDATE_CURRENT_PAGE'

export interface UpdateCurrentPage {
  type: typeof UPDATE_CURRENT_PAGE
  page: string
}

export type CurrentPageActionTypes = UpdateCurrentPage

export type CurrentPageState = 'main' | 'search' | 'content' | 'user_account'
