import { createContext } from 'react'
import { Gates } from '../../ticket.types'
import { Gate } from '../../ticket_incoming_data.types'

interface GatesContextProps {
  gates: Gates
  getLabel: (iata: string) => string // NOTE: label or gate iata fallback
  getGate: (iata: string) => Gate | null
}

export const buildGatesContext = (gates: Gates): GatesContextProps => {
  return {
    gates,
    getLabel: (iata: string) => (gates[iata] || {}).label || iata,
    getGate: (iata: string) => gates[iata] || null,
  }
}

const GatesContext = createContext<GatesContextProps>(buildGatesContext({}))

export default GatesContext
