import { FilterCheckStatus } from './../filters/airlines_filter.utils'
import {
  PopularFilter,
  FilterData,
  PopularFiltersTypes,
  GlobalFilters,
  PopularFiltersLogicTypes,
  ChosenFilter,
} from './popular_filters.types'
import { Map } from 'common/base_types'
import { getStopsFilterName } from '../filters/filters.utils'
import { FilterNames } from '../filters/filters.types'
import i18next from 'i18next'

const isObjectEmpty = (object: any) => {
  return !(object && Object.keys(object).length)
}

const getPopularFilterLogicType = (popularFilter: PopularFilter) => {
  // if popularFilter has field 'value: false' then it's type AllExceptOne
  if (popularFilter.value !== undefined && popularFilter.value === false) {
    return PopularFiltersLogicTypes.AllExceptOne
  }

  return PopularFiltersLogicTypes.OnlyOne
}

// takes boundary map with all possible values for current filter
// returns filter map with all values set to true (unchecked) except filterValueKeys array values
const prepareFilterTypeOnly = (boundary: Map<any>, filterValueKeys: string[]): Map<any> => {
  if (isObjectEmpty(boundary) || !filterValueKeys.length) {
    return {}
  }

  return Object.keys(boundary).reduce((result, boundaryKey) => {
    if (typeof boundary[boundaryKey] === 'object') {
      result[boundaryKey] = prepareFilterTypeOnly(boundary[boundaryKey], filterValueKeys)
    } else {
      // don't add filterValueKey to result
      if (filterValueKeys.includes(boundaryKey)) {
        return result
      }
      result[boundaryKey] = true
    }
    return result
  }, {})
}

const getFilterStateTypeOnly = (
  filterName: FilterNames,
  boundary: Map<any>,
  filterValueKeys: string[],
  globalFilters: GlobalFilters,
) => {
  const filterState = prepareFilterTypeOnly(boundary, filterValueKeys)

  switch (filterName) {
    case FilterNames.Airlines:
      return {
        ...globalFilters[filterName],
        keys: filterValueKeys,
        checkStatus: filterValueKeys.length
          ? FilterCheckStatus.checked
          : FilterCheckStatus.unchecked,
      }
    default:
      return filterState
  }
}

const getFilterStateTypeExcept = (
  filterName: FilterNames,
  filterValue: string,
  globalFilters: GlobalFilters,
) => {
  if (!filterValue) {
    return {}
  }

  switch (filterName) {
    // Airlines
    case FilterNames.Airlines:
      return {
        ...globalFilters[filterName],
        keys: [filterValue],
        checkStatus: FilterCheckStatus.unchecked,
      }
    // Gates
    case FilterNames.Gates:
      return {
        ru: {
          [filterValue]: true,
        },
        other: {
          [filterValue]: true,
        },
      }
    default:
      return {
        [filterValue]: true,
      }
  }
}

export const getFilterState = (
  filterName: FilterNames,
  boundary: Map<any>,
  choosenFilter: ChosenFilter,
  globalFilters: GlobalFilters,
) => {
  if (choosenFilter.type === PopularFiltersLogicTypes.AllExceptOne) {
    // take choosenFilter.values[0], because in type 'AllExceptOne'
    // we always have only one value
    return getFilterStateTypeExcept(filterName, choosenFilter.values[0], globalFilters)
  }

  return getFilterStateTypeOnly(filterName, boundary, choosenFilter.values, globalFilters)
}

// Baggage
const getBaggageFilter = (popularFilter: PopularFilter): FilterData | undefined => {
  const getOppositeName = (name) => (name === 'no_baggage' ? 'full_baggage' : 'no_baggage')
  let filterLogicType = getPopularFilterLogicType(popularFilter)
  let label = i18next.t(`baggage:type.${popularFilter.name}`)
  let newName = popularFilter.name
  let i18nKey = `baggage:type.${PopularFiltersLogicTypes.OnlyOne}.${popularFilter.name}`

  // because filter 'Baggage' has only two values ('full_baggage' and 'no_baggage')
  // we avoid logic type 'OnlyOne' and always set to 'AllExceptOne' and swap it's name
  if (filterLogicType === PopularFiltersLogicTypes.OnlyOne) {
    newName = getOppositeName(popularFilter.name)
  } else {
    label = i18next.t(`baggage:type.${getOppositeName(popularFilter.name)}`)
    i18nKey = `baggage:type.${PopularFiltersLogicTypes.OnlyOne}.${getOppositeName(
      popularFilter.name,
    )}`
  }

  return {
    ...popularFilter,
    name: newName,
    label,
    filterName: FilterNames.Baggage,
    filterLogicType: PopularFiltersLogicTypes.AllExceptOne,
    tooltipText: i18next.t(i18nKey),
  }
}

// Stops
const getStopsFilter = (popularFilter: PopularFilter): FilterData | undefined => {
  const filterLogicType = getPopularFilterLogicType(popularFilter)
  let label = getStopsFilterName(popularFilter.name)
  let tooltipText = getStopsFilterName(
    popularFilter.name,
    'stops:showProposalsWithoutStops',
    'stops:showProposalsStopsCount',
  )

  if (filterLogicType === PopularFiltersLogicTypes.AllExceptOne) {
    label = getStopsFilterName(
      popularFilter.name,
      'stops:onlyWithStops',
      'stops:allStopsExceptCount',
    )
    tooltipText = getStopsFilterName(
      popularFilter.name,
      'stops:showAllProposalsWithoutStopsExcept',
      'stops:showAllProposalsStopsCountExcept',
    )
  }

  return {
    ...popularFilter,
    label,
    filterName: FilterNames.Stops,
    filterLogicType,
    tooltipText,
  }
}

// Airlines
const getAirlinesFilter = (
  popularFilter: PopularFilter,
  airlinesInfo: Map<any>,
): FilterData | undefined => {
  let label = airlinesInfo[popularFilter.name]
    ? airlinesInfo[popularFilter.name].name
    : popularFilter.name
  const filterLogicType = getPopularFilterLogicType(popularFilter)
  let tooltipText = i18next.t('airlines:showAirlineProposals', { airlineName: label })

  if (filterLogicType === PopularFiltersLogicTypes.AllExceptOne) {
    tooltipText = i18next.t('airlines:showAllProposalsAirlineExcept', { airlineName: label })
    label = i18next.t('airlines:allExceptAirline', { airlineName: label })
  }

  return {
    ...popularFilter,
    label,
    filterName: FilterNames.Airlines,
    filterLogicType,
    tooltipText,
  }
}

// PaymentMethods
const getPaymentMethodsFilter = (popularFilter: PopularFilter): FilterData | undefined => {
  const filterLogicType = getPopularFilterLogicType(popularFilter)
  const labelKey =
    filterLogicType === PopularFiltersLogicTypes.AllExceptOne
      ? 'paymentExceptMethods'
      : 'paymentMethods'
  const tooltipKey =
    filterLogicType === PopularFiltersLogicTypes.AllExceptOne
      ? 'showProposalsExceptPaymentMethods'
      : 'showProposalsWithPaymentMethods'

  let label = i18next.t(`payment:${labelKey}.${popularFilter.name}`) || popularFilter.name
  let tooltipText = i18next.t(`payment:${tooltipKey}.${popularFilter.name}`) || popularFilter.name

  return {
    ...popularFilter,
    label,
    filterName: FilterNames.PaymentMethods,
    filterLogicType,
    tooltipText,
  }
}

// Gates
const getGatesFilter = (
  popularFilter: PopularFilter,
  gatesInfo: Map<any>,
): FilterData | undefined => {
  const filterLogicType = getPopularFilterLogicType(popularFilter)
  let label = gatesInfo[popularFilter.name]
    ? gatesInfo[popularFilter.name].label
    : popularFilter.name
  let tooltipText = ''

  if (filterLogicType === PopularFiltersLogicTypes.AllExceptOne) {
    tooltipText = i18next.t('gates:showProposalsExceptGateName', { gateName: label })
    label = i18next.t('gates:gatesExceptGateName', { gateName: label })
  } else {
    tooltipText = i18next.t('gates:showProposalsWithGateName', { gateName: label })
    label = i18next.t('gates:gateName', { gateName: label })
  }

  return {
    ...popularFilter,
    filter: PopularFiltersTypes.GatesOnly,
    label,
    filterName: FilterNames.Gates,
    filterLogicType,
    tooltipText,
  }
}

// prepare raw data from backend to usable data for component
export const transformPopularFiltersData = (
  popularFilters: PopularFilter[],
  extraData: any,
): FilterData[] | undefined => {
  if (!popularFilters.length) {
    return
  }

  const result = popularFilters
    .map((popularFilter: PopularFilter) => {
      if (!popularFilter.filter || !popularFilter.name) {
        return
      }

      switch (popularFilter.filter) {
        // Baggage
        case PopularFiltersTypes.Baggage:
        case PopularFiltersTypes.BaggageOnly:
          return getBaggageFilter(popularFilter)
        // Stops
        case PopularFiltersTypes.Stops:
        case PopularFiltersTypes.StopsOnly:
          return getStopsFilter(popularFilter)
        // Airlines
        case PopularFiltersTypes.Airlines:
        case PopularFiltersTypes.AirlinesOnly:
          return getAirlinesFilter(popularFilter, extraData.airlinesInfo)
        // PaymentMethods
        case PopularFiltersTypes.PaymentMethods:
        case PopularFiltersTypes.PaymentMethodsOnly:
          return getPaymentMethodsFilter(popularFilter)
        // Gates
        case PopularFiltersTypes.Gates:
        case PopularFiltersTypes.GatesOtherLang:
        case PopularFiltersTypes.GatesOnly:
        case PopularFiltersTypes.GatesOtherLangOnly:
          return getGatesFilter(popularFilter, extraData.gatesInfo)
        default:
          return
      }
    })
    .filter(Boolean)

  return result as FilterData[]
}
