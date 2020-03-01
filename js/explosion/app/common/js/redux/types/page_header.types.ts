import { PageHeaderParams, FormType, TabParams } from 'form/types'

export const UPDATE_PAGE_HEADER = 'UPDATE_PAGE_HEADER'
export const UPDATE_TAB_PARAMS = 'UPDATE_TAB_PARAMS'
export const PAGE_HEADER_MOUNT_WITHOUT_ORIGIN = 'PAGE_HEADER_MOUNT_WITHOUT_ORIGIN'

export interface UpdatePageHeaderAction {
  type: typeof UPDATE_PAGE_HEADER
  data: Partial<PageHeaderState>
}

export interface UpdateTabParamsAction {
  type: typeof UPDATE_TAB_PARAMS
  tab: FormType
  params: Partial<TabParams>
}

export interface PageHeaderMountWithoutOrigin {
  type: typeof PAGE_HEADER_MOUNT_WITHOUT_ORIGIN
}

export type PageHeaderActions =
  | UpdatePageHeaderAction
  | UpdateTabParamsAction
  | PageHeaderMountWithoutOrigin

export type PageHeaderState = PageHeaderParams
