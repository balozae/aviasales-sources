import { Segment, Flight } from '../ticket_incoming_data.types'
import { AirlinesContextProps } from '../ticket_context/airlines_context/airlines_context'

// J2 airline has child company – Buta Airways (but with same iata code)
// We need to add extra "pseudo" carrier when J2 flight number between 9001 and 9999
// Same for KC - child FlyArystan
const CHILD_IATAS = {
  J2buta: 'J2buta',
  KCFlyArystan: 'KCFlyArystan',
}

export const getCarrierName = (
  carrierIata: string,
  getName: AirlinesContextProps['getName'],
): string => {
  if (carrierIata === CHILD_IATAS.J2buta) {
    return 'Buta Airways'
  }

  if (carrierIata === CHILD_IATAS.KCFlyArystan) {
    return 'FlyArystran'
  }

  return getName(carrierIata)
}

export const prepareTicketCarriers = (segments: Segment[]): string[] => {
  const result: Set<string> = new Set()
  segments.forEach((segment) =>
    segment.flight.forEach((flight) => {
      result.add(prepareOneTicketCarrier(flight))
    }),
  )
  return Array.from(result)
}

export const prepareOneTicketCarrier = (flight: Flight) => {
  if (isJ2butaCarrier(flight)) {
    return CHILD_IATAS.J2buta
  } else if (isKCFlyArystanCarrier(flight)) {
    return CHILD_IATAS.KCFlyArystan
  } else {
    return flight.operating_carrier
  }
}

const isJ2butaCarrier = (flight: Flight): boolean => {
  return flight.operating_carrier === 'J2' && flight.number > 9001 && flight.number < 9999
}

const isKCFlyArystanCarrier = (flight: Flight): boolean => {
  return (
    (flight.operating_carrier === 'KC' || flight.operating_carrier === 'КС') && // check latin and cyrillic letters
    flight.number > 6999 &&
    flight.number < 8000
  )
}
