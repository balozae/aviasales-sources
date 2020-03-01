import { SearchParams } from 'common/types/index'
import { stringify } from 'query-string'
import cookies from 'oatmeal-cookie'
import { format as formatDate, addDays } from 'finity-js'
import {
  DateField,
  PlaceField,
  DateType,
  SearchParams as AviaFormSearchParams,
  Segment,
} from 'form/components/avia_form/avia_form.types'

const HOST = 'https://hotels.aviasales.ru/hotels'
const BOOKING_HOST = 'http://www.booking.com/searchresults.html'

export type tBookingUrlParams = {
  currency: string
  utm: string
  utmCampaign: string
  utmSource: string
  utmMedium: string
  utmContent?: string
  fallbackLabel?: string
  language?: string
}

export type tBookingUrlSearchParams = {
  childrenCount: number
  infantsCount: number
  adultsCount: number
  destinationIATA: string
  destinationCountryIATA?: string
  dateFrom: string
  dateTo?: string
}

export type tFallbackUrlParams = {
  currency: string
  dateFrom: string
  label: string
  dateTo?: string
}

/**
 * Fallback url
 * When proxy url with error
 *
 * @param urlParams
 * @param special
 */
export function createFallbackUrl(urlParams: tFallbackUrlParams, special: Object = {}) {
  const marker = cookies.fetch('marker', 'direct')

  const dateFromArr = urlParams.dateFrom.split('-')
  const falbackParams: { [key: string]: any } = {
    aid: 338584,
    city: -2960561,
    label: urlParams.label,
    checkin_monthday: dateFromArr[2],
    checkin_year_month: `${dateFromArr[0]}-${dateFromArr[1]}`,
    do_availability_check: 1,
    selected_currency: urlParams.currency,
    marker,
  }

  if (urlParams.dateTo) {
    const dateToArr = urlParams.dateTo.split('-')
    falbackParams.checkout_monthday = dateToArr[2]
    falbackParams.checkout_year_month = `${dateToArr[0]}-${dateToArr[1]}`
  }

  return encodeURIComponent(BOOKING_HOST + '?' + stringify({ ...falbackParams, ...special }))
}

/**
 * Create booking. Redirect to booking from proxy
 * With Fallback
 *
 * @param urlParams
 * @param special
 */
export function createBookingUrl(
  urlParams: tBookingUrlParams & tBookingUrlSearchParams,
  special: Object = {},
  urlHost?: string,
) {
  const children: Array<number> = []
  const host = urlHost || HOST

  for (let i = 0; i < (urlParams.childrenCount || 0); i++) {
    children.push(7)
  }
  for (let i = 0; i < (urlParams.infantsCount || 0); i++) {
    children.push(1)
  }

  urlParams.utm = urlParams.utm || 'aviasales'

  const params = stringify({
    language: urlParams.language || 'ru',
    skipRulerCheck: 'skip',
    gateId: 2,
    destination: urlParams.destinationIATA,
    destination_country_code: urlParams.destinationCountryIATA,
    checkIn: urlParams.dateFrom,
    checkOut: urlParams.dateTo,
    adults: urlParams.adultsCount,
    children: `${children}`,
    currency: urlParams.currency,
    marker: cookies.fetch('marker', 'direct'),
    as_auid: cookies.get('auid'),
    utm: urlParams.utm,
    utm_source: urlParams.utmSource,
    utm_medium: urlParams.utmMedium,
    utm_campaign: urlParams.utmCampaign,
    utm_content: urlParams.utmContent,
    sp: true,
    fallback: createFallbackUrl({
      currency: urlParams.currency,
      dateFrom: urlParams.dateFrom,
      dateTo: urlParams.dateTo,
      label: urlParams.fallbackLabel || urlParams.utm,
    }),
    ...special,
  })

  return `${host}?${params}`
}

/**
 * Search params mapper
 * Map searchParams to query params
 *
 * @param searchParams
 * @param params
 * @param special
 */
export function createBookingUrlFromSearchParams(
  searchParams: AviaFormSearchParams | SearchParams,
  params: tBookingUrlParams,
  special: Object = {},
  urlHost?: string,
) {
  let destinationIATA = ''
  try {
    destinationIATA =
      // @ts-ignore NOTE: searchParams может придти в разных форматах (см. типы выше)
      searchParams.destinationCityIata || searchParams.segments[0][PlaceField.Destination]!.iata
  } catch (e) {
    destinationIATA = ''
  }

  let destinationCountryIATA = ''
  try {
    destinationCountryIATA = searchParams.segments[0][PlaceField.Destination]!.countryIata
  } catch (e) {
    destinationCountryIATA = ''
  }

  const departDate = (getDate(searchParams.segments, DateType.DepartDate) || new Date()) as Date
  let checkOutDate
  if (!getDate(searchParams.segments, DateType.ReturnDate)) {
    checkOutDate = addDays(departDate, 3)
  } else {
    checkOutDate = (getDate(searchParams.segments, DateType.ReturnDate) || new Date()) as Date
  }

  return createBookingUrl(
    {
      childrenCount: searchParams.passengers.children,
      infantsCount: searchParams.passengers.infants,
      adultsCount: searchParams.passengers.adults,
      destinationIATA: destinationIATA,
      destinationCountryIATA: destinationCountryIATA,
      dateFrom: formatDate(departDate, 'YYYY-MM-DD'),
      dateTo: formatDate(checkOutDate, 'YYYY-MM-DD'),
      ...params,
    },
    special,
    urlHost,
  )
}

/**
 * Get date from segment
 *
 * @param segments {ReadonlyArray<Segment>}
 * @param type {DateType}
 */
function getDate(segments: ReadonlyArray<Segment>, type: DateType): DateField {
  const segmentIndex = type === DateType.DepartDate ? 0 : 1
  const segment = segments[segmentIndex]
  if (segment) {
    return segment.date || undefined
  }
  return undefined
}
