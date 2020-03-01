import axios, { CancelTokenSource } from 'axios'
import { Place, PlaceType } from 'form/components/avia_form/avia_form.types'
import { stringify } from 'query-string'
import { Dirty } from 'common/base_types'
import i18next from 'i18next'

export interface AutocompletePlace {
  type: PlaceType
  code: string
  iata: string
  name: string
  index_strings: string[]
  coordinates: { lon: number; lat: number }
  weight: number
  city_code?: string
  city_iata?: string
  country_code?: string
  country_name?: string
  city_name?: string
  cases?: Declentions
  main_airport_name?: string
}

const PLACES_URL = 'https://places.aviasales.ru/v2/places.json?'
const HOTELS_URL = 'https://engine.hotellook.com/api/v2/lookup.json?'

const getPlacesUrl = (
  fetchHotels: boolean,
  allowOpenSearch: boolean,
  query: string,
  locale?: string,
) => {
  if (!fetchHotels) {
    const types = ['city', 'airport']
    if (allowOpenSearch) {
      types.push('country')
    }
    return (
      PLACES_URL +
      stringify(
        {
          locale: locale ? locale.toLowerCase() : i18next.language,
          max: 7,
          types: types,
          term: query,
        },
        { arrayFormat: 'bracket' },
      )
    )
  } else {
    return (
      HOTELS_URL +
      stringify({
        lang: locale ? locale.toLowerCase() : i18next.language,
        limit: 3,
        query,
      })
    )
  }
}

interface Options {
  allowOpenSearch: boolean
  locale?: string
  stopCancellation?: boolean
  fetchHotels?: boolean
}

interface HotelsAutocompleteResponse {
  status: 'ok'
  results: {
    hotels: {
      fullName: string
      id: string
      label: string
      location: { lat: number; lon: number }
      locationId: number
      locationName: string
      _score: number
    }[]
    locations: {
      cityName: string
      countryCode: string
      countryName: string
      fullName: string
      hotelsCount: number
      iata: string[]
      id: number
      location: { lat: number; lon: number }
      _score: number
    }[]
  }
}

type RequestResultStatus = 'ok' | 'error' | 'skip'
type PerformRequestResult = [RequestResultStatus, Array<Place>]
type serverResponseFn = (suggestions: Place[]) => void

export default class AutocompleteFetcher {
  cancelTokenSource: CancelTokenSource | null
  stopCancellation: boolean
  allowOpenSearch: boolean
  fetchHotels: boolean = false
  locale?: string

  private requests: Array<String> = []
  private callbacks: serverResponseFn[] = []

  static getSuggestion(suggestions: Place[], query: string): Place {
    let suggestion: Dirty<Place>
    if (query.length === 3) {
      suggestion = suggestions.find(
        (suggest) => suggest.iata.toLocaleLowerCase() === query.toLocaleLowerCase(),
      )
    }

    return suggestion || suggestions[0]
  }

  constructor(options: Options) {
    this.allowOpenSearch = options.allowOpenSearch
    this.locale = options.locale
    this.fetchHotels = options.fetchHotels || false
    this.stopCancellation = options.stopCancellation || false
  }

  onServerResponse = (fn: serverResponseFn) => this.callbacks.push(fn)

  performRequest = async (term: string): Promise<PerformRequestResult> => {
    if (!term) {
      return ['skip', []]
    }

    if (!this.stopCancellation && this.cancelTokenSource) {
      this.cancelTokenSource.cancel()
    }
    this.cancelTokenSource = axios.CancelToken.source()
    const query = term.trim().toLowerCase()
    const URL = getPlacesUrl(this.fetchHotels, this.allowOpenSearch, query, this.locale)
    const hash = `${URL}&${Math.random()
      .toString(36)
      .substring(7)}`
    this.requests.push(hash)
    try {
      const response = await axios.get<AutocompletePlace[] | HotelsAutocompleteResponse>(URL, {
        cancelToken: this.cancelTokenSource.token,
      })
      let suggestions: Place[] = []
      if (!this.fetchHotels) {
        suggestions = this.processPlacesResponse(
          term.trim().toLowerCase(),
          response.data as AutocompletePlace[],
        )
      } else {
        suggestions = this.processHotelsResponse(
          term.trim().toLowerCase(),
          response.data as HotelsAutocompleteResponse,
        )
      }
      this.cancelTokenSource = null
      this.callbacks.forEach((callback) => {
        callback(suggestions)
      })
      this.callbacks = []
      this.requests = this.requests.filter((reqHash) => reqHash !== hash)
      return ['ok', suggestions]
    } catch (error) {
      this.requests = this.requests.filter((reqHash) => reqHash !== hash)
      return ['error', [error]]
    }
  }

  isInProgress(): boolean {
    return !!this.requests.length
  }

  private processHotelsResponse = (
    query: string,
    response: HotelsAutocompleteResponse,
  ): Place[] => {
    const { hotels, locations } = response.results
    const hotelsResults: Place[] = hotels.map((hotel) => {
      return {
        iata: hotel.id,
        name: hotel.label,
        type: PlaceType.Hotel,
        cityName: hotel.locationName,
      }
    })
    const locationResults: Place[] = locations.map((location) => {
      return {
        iata: location.iata[0] || '',
        name: location.cityName,
        hotelsCount: location.hotelsCount,
        countryIata: location.countryCode,
        countryName: location.countryName,
        cityName: location.cityName,
        type: PlaceType.HotelCity,
        locationId: location.id,
      }
    })
    return hotelsResults.concat(locationResults)
  }

  private processPlacesResponse = (query: string, suggestions: AutocompletePlace[]): Place[] => {
    if (!(suggestions || Array.isArray(suggestions))) {
      return []
    }
    const inMetropolis = (airport: Place) =>
      suggestions.some((place) => place.type === PlaceType.City && place.code === airport.city_code)
    const isMetropolis = (city: Place) =>
      suggestions.some(
        (airport) => airport.type === PlaceType.Airport && airport.city_code === city.code,
      )
    return suggestions.map((place: AutocompletePlace) => {
      const { type, weight, name, main_airport_name } = place
      const matchedByAirport = main_airport_name
        ? main_airport_name.toLowerCase().indexOf(query) >= 0
        : false
      return {
        iata: place.code,
        cityIata: place.city_code || place.iata,
        coordinates: place.coordinates,
        countryIata: place.country_code,
        countryName: place.country_name,
        cityName: place.city_name,
        cases: place.cases,
        inMetropolis: type === PlaceType.Airport && inMetropolis(place),
        isMetropolis: type === PlaceType.City && isMetropolis(place),
        name: matchedByAirport ? main_airport_name! : name,
        type,
        weight,
      }
    })
  }
}
