import { SelectListData } from './select_list/select_list.types'

export enum LocaleSelectorType {
  currency = 'currency',
  language = 'language',
  country = 'country',
}

export type LocaleData = { [key in LocaleSelectorType]?: SelectListData }
