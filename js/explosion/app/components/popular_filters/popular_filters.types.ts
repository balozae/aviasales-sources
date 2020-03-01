import { FilterNames } from '../filters/filters.types'

export interface PopularFilter {
  filter: PopularFiltersTypes
  name: string
  value?: boolean
}

export interface FilterData extends PopularFilter {
  label: string
  filterName: FilterNames
  isChosen?: boolean
  filterLogicType: PopularFiltersLogicTypes
  tooltipText: string
}

export enum PopularFiltersTypes {
  BaggageOnly = 'BAGGAGE_ONLY',
  StopsOnly = 'STOPS_ONLY',
  AirlinesOnly = 'AIRLINES_ONLY',
  PaymentMethodsOnly = 'PAYMENT_METHODS_ONLY',
  GatesOnly = 'GATES_ONLY',
  GatesOtherLangOnly = 'GATES_OTHER_LANG_ONLY',

  Baggage = 'BAGGAGE',
  Stops = 'STOPS',
  Airlines = 'AIRLINES',
  PaymentMethods = 'PAYMENT_METHODS',
  Gates = 'GATES',
  GatesOtherLang = 'GATES_OTHER_LANG',
}

export enum PopularFiltersLogicTypes {
  OnlyOne = 'onlyOne',
  AllExceptOne = 'allExceptOne',
}

export type GlobalFilters = { [key in FilterNames]: any }

export interface ChosenFilter {
  type: PopularFiltersLogicTypes
  values: string[]
}

export type ChosenFilters = { [key in FilterNames]: ChosenFilter } | {}
