import { AnyAction } from 'redux'
import { format as formatDate } from 'finity-js'
import { ThunkAction } from 'redux-thunk'
import { stringify } from 'query-string'
import { AppState } from '../../types/root/explosion'
import { getDate, getPlace } from 'form/components/avia_form/utils'
import {
  SearchParams,
  DateField,
  TripDuration,
  DateType,
  PlaceField,
} from 'form/components/avia_form/avia_form.types'
import Goalkeeper from 'common/bindings/goalkeeper'
import { getOriginUrl } from './start_search.utils'

export const startOpenSearch = (
  params: SearchParams,
): ThunkAction<void, AppState, any, AnyAction> => () => {
  const href =
    `${getOriginUrl()}/map?` +
    stringify({
      ...params.passengers,
      depart_date: _covertDateToQueryString(getDate(params.segments, DateType.DepartDate)),
      return_date: _covertDateToQueryString(getDate(params.segments, DateType.ReturnDate)),
      origin_iata: getPlace(params.segments, PlaceField.Origin).iata,
      destination_iata: getPlace(params.segments, PlaceField.Destination).iata,
    })
  Goalkeeper.triggerEvent('avia_form', 'open_search', 'started')
  window.location.assign(href)
}

const _covertDateToQueryString = (date: DateField): string | undefined => {
  if (date instanceof TripDuration) {
    return `min:${date.min},max:${date.max}`
  }
  if (Array.isArray(date)) {
    let monthArray = date.map((m) => m.getMonth() + 1)
    monthArray.sort((a, b) => (a > b ? 1 : -1))
    return monthArray.join(',')
  }
  if (date instanceof Date) {
    return formatDate(date, 'YYYY-MM-DD')
  }
  return undefined
}
