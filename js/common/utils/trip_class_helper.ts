import { TripClass } from 'common/types'

const tripClassNamesMap: { [key in TripClass]: string } = {
  [TripClass.Economy]: 'economy',
  [TripClass.PremiumEconomy]: 'premium',
  [TripClass.Business]: 'business',
  [TripClass.FirstClass]: 'first',
}

// Y - economy, default
export const checkTripClass = (value: string | number = 'Y'): TripClass => {
  // NOTE: support old format 1(Business) and 0(Economy) for affiliates
  const code = String(value).toUpperCase()
  if (code === '1') {
    return TripClass.Business
  } else if (Object.values(TripClass).includes(code as TripClass)) {
    return code as TripClass
  } else {
    return TripClass.Economy
  }
}

export const getTripClassNameFromCode = (
  value: string | number = 'Y',
  codeToNameMap: { [key in TripClass]: string },
): string => codeToNameMap[checkTripClass(value)]
