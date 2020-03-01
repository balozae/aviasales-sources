import React from 'react'
import { Airports } from '../../ticket.types'
import { Airport } from '../../ticket_incoming_data.types'

export type PlacesContextProps = {
  getPlace: (iata: string) => Airport | null
  getPlaceName: (iata: string) => string
  getCityName: (iata: string) => string
  getCountryCode: (iata: string) => string | null
  airports: Airports
}

export const buildPlacesContext = (airports: Airports) => ({
  airports,
  getPlace: (iata: string) => airports[iata],
  getPlaceName: (iata: string) => (airports[iata] || {}).name || iata,
  getCityName: (iata: string) => {
    let cityAirport: Airport | undefined = airports[iata]
    if (!cityAirport) {
      cityAirport = Object.values(airports).find((airport) => airport.city_code === iata)
    }
    return cityAirport ? cityAirport.city || iata : iata
  },
  getCountryCode: (iata: string): string | null => {
    return (airports[iata] && airports[iata].country_code) || null
  },
})

export const defaultPlacesContext = buildPlacesContext({})

const PlacesContext = React.createContext<PlacesContextProps>(defaultPlacesContext)

export default PlacesContext
