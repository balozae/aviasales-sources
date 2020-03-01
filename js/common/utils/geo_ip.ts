import i18n from 'i18next'
import axios from 'axios'
import { Place, PlaceCoordinates } from 'form/components/avia_form/avia_form.types'
import TripParams from 'utils/trip_params.coffee'

interface GeoIpPlace {
  coordinates: PlaceCoordinates
  city_code?: string
  city_name?: string
  code?: string
  name?: string
}

const getGeoIpUrl = (locale: string) =>
  `https://places.aviasales.ru/v1/nearest_places.json?locale=${locale.toLowerCase()}`
let geoipResult: Place[]

export const fetchGeoIp = async (locale?: string): Promise<Place[]> => {
  locale = locale || i18n.language || 'ru'

  if (geoipResult) {
    return geoipResult
  }

  try {
    const { data } = await axios.get<GeoIpPlace[]>(getGeoIpUrl(locale))
    return data.map((place) =>
      TripParams.ensureCity({
        coordinates: place.coordinates,
        iata: place.city_code || place.code,
        name: place.city_name || place.name,
      }),
    )
  } catch (error) {
    console.error('Error in fetchGeoIp()\n', error)
    return []
  }
}

export const getGeoIpCoordinates = async (locale?: string) => {
  const places = await fetchGeoIp(locale)
  return places && places[0] && places[0].coordinates
}

export const getGeoIpCityIata = async (locale?: string) => {
  const places = await fetchGeoIp(locale)
  return places && places[0] && places[0].cityIata
}
