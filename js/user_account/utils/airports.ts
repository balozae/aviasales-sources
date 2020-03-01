import { AppState } from 'user_account/types/app.types'
import { Airport, AirportsData } from 'user_account/types/airports.types'
import { getAirportsData } from 'user_account/selectors/airports.selectors'

export const filterKnownAirportsIatas = (state: AppState, iatas: string[]): string[] => {
  const airports = getAirportsData(state)
  const knownAirportsIatas = Object.keys(airports)
  return iatas.filter((iata) => !knownAirportsIatas.includes(iata))
}

export const getAirportByIata = (airports?: AirportsData, iata?: string) => {
  if (!airports || !iata) {
    return
  }

  return airports[iata]
}

export const getAirportNameByLocale = (airport: Airport, locale: string): string | undefined => {
  if (airport && locale && airport.translations[locale]) {
    return airport.translations[locale].su
  }
}

export const getAirportNameCasesByLocale = (airport?: Airport, locale?: string) => {
  if (!airport || !locale) {
    return
  }

  return airport.translations[locale]
}

export const prepareAirportsFromResponse = (airportsFromResponse?: Airport[]) => {
  if (!airportsFromResponse || airportsFromResponse.length === 0) {
    return {}
  }

  return airportsFromResponse.reduce((result, airport) => {
    result[airport.iata] = airport
    return result
  }, {})
}
