import {
  TripDuration,
  Place,
  Segment,
  PlaceField,
  Passengers,
  PlaceType,
} from 'form/components/avia_form/avia_form.types'
import i18next from 'i18next'

export const TRIP_DURATION = new TripDuration(7, 14)

export const ANYWHERE: Place = {
  type: PlaceType.Anywhere,
  iata: '',
  name: i18next.t('avia_form:anywhere'),
  weight: 0,
}

const date = new Date()
date.setDate(1)
export const DEFAULT_MONTH = date

export const DEFAULT_PLACE: Place = {
  iata: '',
  cityIata: '',
  name: '',
  type: PlaceType.Airport,
}

export const DEFAULT_PASSENGERS: Passengers = {
  adults: 1,
  children: 0,
  infants: 0,
}

export const DEFAULT_SEGMENT: Segment = {
  [PlaceField.Origin]: DEFAULT_PLACE,
  [PlaceField.Destination]: DEFAULT_PLACE,
  date: undefined,
}

export const ENABLE_FORM_TIMEOUT = 2000

export const SEARCH_HOTELS_COOKIE = 'uncheck_hotel_cookie'

export const HINT_COOKIE_NAME = 'form_hint_closed'
