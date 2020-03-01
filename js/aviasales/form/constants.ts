import { PageHeaderParams, FormType } from 'form/types'

export const DEFAULT_AVAILABLE_TABS: Array<FormType> = ['avia', 'hotel', 'cars', 'insurance']
export const DEFAULT_BRAND_NAME = 'aviasales'

export const DEFAULT_PAGE_HEADER_PARAMS: Partial<PageHeaderParams> = {
  tabs: {},
  activeForm: 'avia',
  showHeader: false,
  mainTitleTag: 'h1',
  availableTabs: DEFAULT_AVAILABLE_TABS,
  brandName: DEFAULT_BRAND_NAME,
}

export const NAVBAR_WITH_OFFSET_HEIGHT = 70
export const FORM_FIELDS_HEIGHT = 60
