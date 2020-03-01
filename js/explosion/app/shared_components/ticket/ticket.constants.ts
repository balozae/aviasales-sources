import { Proposals } from './ticket.types'
import { TariffType } from 'shared_components/types/tariffs'

export const defaultProposals: Proposals = {
  [TariffType.HasBaggage]: [],
  [TariffType.OtherBaggage]: [],
  priceDifference: 0,
}

export const MIN_SEATS_LEFT: number = 8

export const MAX_VISIBLE_PROPOSALS = 3
