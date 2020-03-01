import { RawProposal } from 'shared_components/ticket/ticket_incoming_data.types'

export enum TariffType {
  OtherBaggage = 'otherBaggage',
  HasBaggage = 'hasBaggage',
}

export interface Tariffs {
  hasBaggage: RawProposal[]
  otherBaggage: RawProposal[]
  priceDifference: number
  cheaperTariffKey: TariffType
}

export const UNKNOWN = 'UNKNOWN'
export const NO_BAGS = 'NO_BAGS'

export type BagCodeType = typeof UNKNOWN | typeof NO_BAGS | string

export enum BagType {
  Baggage = 'baggage',
  Handbags = 'handbags',
}

export interface BagInfo {
  amount: number
  code: string
  debug: string
  weight?: number | string
  dimensions?: string
}

export interface Bags {
  [BagType.Baggage]: BagInfo
  [BagType.Handbags]: BagInfo
}
