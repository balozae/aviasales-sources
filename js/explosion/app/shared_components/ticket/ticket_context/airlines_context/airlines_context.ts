import { createContext } from 'react'
import { Airlines } from '../../ticket.types'
import { Airline } from '../../ticket_incoming_data.types'

export interface AirlinesContextProps {
  airlines: Airlines
  getName: (iata: string) => string // NOTE: name or airline iata fallback
  getAirline: (iata: string) => Airline | null
}

export const buildAirlinesContext = (airlines: Airlines): AirlinesContextProps => {
  return {
    airlines,
    getName: (iata: string) => (airlines[iata] || {}).name || iata,
    getAirline: (iata: string) => airlines[iata] || null,
  }
}

const AirlinesContext = createContext<AirlinesContextProps>(buildAirlinesContext({}))

export default AirlinesContext
