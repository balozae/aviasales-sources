import { format, addDays } from 'finity-js'
import { stringify } from 'query-string'
import flagr from 'common/utils/flagr_client_instance'
import { ChangesOfAirport } from './ticket_stop.types'
import { SearchParams } from '../ticket.types'
import { Flight, Airport } from '../ticket_incoming_data.types'

const HOTEL_EARLY_CHECKIN_TIME = '06:00'
const DEFAULT_CHILDREN_AGE = '7'
const DEFAULT_INFANTS_AGE = '1'
const HOTELS_NEAR_AIRPORTS_RADIUS = 5
const MAX_DELAY_WITHOUT_HOTEL_NEEDED = 480
const VISA_COUNTRIES = ['AU', 'US']

const getCheckinDate = (arrivalTime: string, arrivalDate: string): string => {
  if (arrivalTime < HOTEL_EARLY_CHECKIN_TIME) {
    const date = new Date(arrivalDate)
    return format(addDays(date, -1), 'YYYY-MM-DD')
  } else {
    return arrivalDate
  }
}

const buildChindlrenString = (
  str: string = '',
  count: number,
  childrenAge: string | string[] | number | number[],
) => {
  if (!count) {
    return str
  }
  const res: string[] = []
  for (let i = 0; i < count; i++) {
    const age = Array.isArray(childrenAge) ? childrenAge[i] : childrenAge
    res.push(age.toString())
  }
  if (str.length && res.length) {
    return `${str},${res.join(',')}`
  }
  return res.join(',')
}

const createHotelUrl = (
  airportArrival: Airport | undefined,
  previousFlight: Flight,
  currentFlight: Flight,
  searchParams: SearchParams,
  locale: string,
  marker?: string,
): string | null => {
  if (!airportArrival) {
    return null
  }

  const { arrival, arrival_time, arrival_date } = previousFlight
  const { children, infants, adults } = searchParams.passengers
  const language = `${locale}-${locale.toUpperCase()}`

  let childrenAgeString = buildChindlrenString('', children, DEFAULT_CHILDREN_AGE)
  childrenAgeString = buildChindlrenString(childrenAgeString, infants, DEFAULT_INFANTS_AGE)

  const params = {
    destination: arrival,
    checkIn: getCheckinDate(arrival_time, arrival_date),
    checkOut: currentFlight.departure_date,
    adults: adults,
    children: childrenAgeString,
    marker,
    utm_source: 'aviasales',
    utm_medium: 'search_results',
    utm_campaign: 'ticket_long_stopover_link',
    language,
    hls: 'aviasales/airport',
  }

  const paramString = stringify(params)
  const { lat = '', lon = '' } = airportArrival.coordinates || {}
  const anchor = [HOTELS_NEAR_AIRPORTS_RADIUS, lat, lon, airportArrival.name].join(';')
  const anchorString = `f[distance]=${anchor}`
  return `https://hotels.aviasales.ru/hotels?${paramString}#${anchorString}`
}

export const getStopPlaceName = (airport: Airport): string => {
  const cases = airport.cases
  const place = cases && cases.pr ? cases.pr : airport.city
  return place
}

export const getChangesOfAirport = (
  prevArrival: string,
  currentDeparture: string,
): ChangesOfAirport | null => {
  if (prevArrival !== currentDeparture) {
    return [prevArrival, currentDeparture]
  } else {
    return null
  }
}

export const getHotelUrl = (
  airportArrival: Airport,
  previousFlight: Flight,
  currentFlight: Flight,
  searchParams: SearchParams,
  locale: string,
  marker?: string,
): string | null => {
  if (currentFlight.delay > MAX_DELAY_WITHOUT_HOTEL_NEEDED) {
    return createHotelUrl(
      airportArrival,
      previousFlight,
      currentFlight,
      searchParams,
      locale,
      marker,
    )
  } else {
    return null
  }
}
