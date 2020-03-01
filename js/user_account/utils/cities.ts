import { AppState } from 'user_account/types/app.types'
import { City, CitiesData } from 'user_account/types/cities.types'
import { getCitiesData } from 'user_account/selectors/cities.selectors'

export const filterKnownCitiesIatas = (state: AppState, iatas: string[]): string[] => {
  const cities = getCitiesData(state)
  const knownCitiesIatas = Object.keys(cities)
  return iatas.filter((iata) => !knownCitiesIatas.includes(iata))
}

export const getCityByIata = (cities?: CitiesData, iata?: string) => {
  if (!cities || !iata) {
    return
  }

  return cities[iata]
}

export const getCityNameByLocale = (city?: City, locale?: string): string | undefined => {
  if (city && locale && city.translations[locale]) {
    return city.translations[locale].su
  }
}

export const prepareCitiesFromResponse = (citiesFromResponse?: City[]) => {
  if (!citiesFromResponse || citiesFromResponse.length === 0) {
    return {}
  }

  return citiesFromResponse.reduce((result, city) => {
    result[city.iata] = city
    return result
  }, {})
}
