import { SearchHistory, TripClass } from 'common/types'
import { getChespestPrice, getFirstFlight, getReturnFlight } from 'common/utils/ticket_helper'
const { getTicketDeparture, getTicketArrival, is_open_jaw } = require('utils')
import { format, parse } from 'finity-js'
import { DateField, Passengers, PlaceField, Place } from '../avia_form/avia_form.types'
import uniqBy from 'lodash/uniqBy'
import { DEFAULT_PASSENGERS } from '../avia_form/avia_form.constants'

export interface HistoryItem {
  originIata: string
  originCityIata: string
  originName?: string
  destinationIata: string
  destinationCityIata: string
  destinationName?: string
  departureDate: DateField
  returnDate?: DateField
  date: string
  passengers: Passengers
  price: number
  createdAt: string
  type: 'history'
  isOneWay: boolean
  tripClass: TripClass
}

type ItemMatchKey = keyof Pick<HistoryItem, 'originCityIata' | 'destinationCityIata'>

export default class SearchHistoryController {
  static getHistoryItems(
    history: SearchHistory[],
    suggestions: Place[],
    type: PlaceField,
    siblingValue: Place,
    inputValue: string,
  ): HistoryItem[] {
    if (!history || !history.length) {
      return []
    }

    let places =
      history &&
      history
        .filter((item) => {
          return !is_open_jaw(item.search_params.segments)
        })
        .sort((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? -1 : 1))
        .map(mapSearchHistoryToHistoryItem)

    places = uniqBy(places, (historyItem: HistoryItem) => {
      const passengers = historyItem.passengers || DEFAULT_PASSENGERS
      const paxCount = passengers.adults + passengers.children + passengers.infants
      const departureDate = format(historyItem.departureDate as Date, 'DDMMYYYY')
      const returnDate =
        historyItem.returnDate instanceof Date
          ? format(historyItem.returnDate as Date, 'DDMMYYYY')
          : ''
      return [
        historyItem.originIata,
        historyItem.destinationIata,
        departureDate,
        returnDate,
        paxCount,
        historyItem.tripClass,
      ].join('')
    })

    if (siblingValue.iata) {
      places = filterBySiblingValue(places, type, siblingValue)
    }

    if (suggestions.length && inputValue) {
      places = filterBySuggestions(places, type, suggestions)
    }

    return places.slice(0, 3)
  }
}

const filterBySiblingValue = function(
  items: HistoryItem[],
  type: PlaceField,
  place: Place,
): HistoryItem[] {
  const key: keyof HistoryItem =
    type === PlaceField.Origin ? 'destinationCityIata' : 'originCityIata'

  return items.filter((item) => {
    return item[key] === place.iata || item[key] === place.cityIata
  })
}

const filterBySuggestions = function(
  items: HistoryItem[],
  type: PlaceField,
  suggestions: Place[],
): HistoryItem[] {
  const key: ItemMatchKey = type === PlaceField.Origin ? 'originCityIata' : 'destinationCityIata'

  return items.filter((item) =>
    suggestions.some((suggestion) => {
      return item[key] === suggestion.cityIata || item[key] === suggestion.iata
    }),
  )
}

const filterBySelectedValue = function(
  items: HistoryItem[],
  type: PlaceField,
  value: Place,
): HistoryItem[] {
  const key: ItemMatchKey = type === PlaceField.Origin ? 'originCityIata' : 'destinationCityIata'

  return items.filter((item) => {
    return item[key] === value.iata || item[key] === value.cityIata
  })
}

const mapSearchHistoryToHistoryItem = (searchHistory: SearchHistory): HistoryItem => {
  const departureDate = getFirstFlight(searchHistory.ticket).departure_date
  const returnDate = getReturnFlight(searchHistory.ticket).departure_date
  const isOneWay = searchHistory.search_params.isOneWay
  const formatDate = (d: string) => format(new Date(d), 'DD MMM')
  const date = isOneWay
    ? `${formatDate(departureDate)}`
    : `${formatDate(departureDate)} — ${formatDate(returnDate)}`

  return {
    originIata: getTicketDeparture([searchHistory.ticket]),
    originCityIata: searchHistory.search_params.originCityIata,
    originName: searchHistory.search_params.originName || '',
    destinationIata: getTicketArrival([searchHistory.ticket]),
    destinationCityIata: searchHistory.search_params.destinationCityIata,
    destinationName: searchHistory.search_params.destinationName || '',
    departureDate: parse(departureDate, 'DD-MM-YYYY'),
    returnDate: isOneWay ? undefined : parse(returnDate, 'DD-MM-YYYY'),
    price: getChespestPrice(searchHistory.ticket.terms),
    passengers: searchHistory.search_params.passengers,
    isOneWay,
    date,
    createdAt: searchHistory.created_at,
    type: 'history',
    tripClass: searchHistory.search_params.tripClass,
  }
}
