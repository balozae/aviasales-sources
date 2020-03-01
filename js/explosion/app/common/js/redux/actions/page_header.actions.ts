import {
  UPDATE_PAGE_HEADER,
  PageHeaderActions,
  PageHeaderState,
  PAGE_HEADER_MOUNT_WITHOUT_ORIGIN,
  UPDATE_TAB_PARAMS,
} from '../types/page_header.types'
import { FormType, TabParams } from 'form/types'

export const updatePageHeader = (data: Partial<PageHeaderState>): PageHeaderActions => ({
  type: UPDATE_PAGE_HEADER,
  data,
})

export const pageHeaderMountWithoutOrigin = (): PageHeaderActions => ({
  type: PAGE_HEADER_MOUNT_WITHOUT_ORIGIN,
})

export const updateTabParams = (tab: FormType, params: Partial<TabParams>): PageHeaderActions => ({
  type: UPDATE_TAB_PARAMS,
  tab,
  params,
})
