import { RawProposal, TicketData } from '../ticket_incoming_data.types'
import {
  Proposal,
  ProposalType,
  Proposals,
  AirlineWithoutPrice,
  Gates,
  Airlines,
} from '../ticket.types'
import { MIN_SEATS_LEFT, MAX_VISIBLE_PROPOSALS } from '../ticket.constants'
import { Currency } from '../ticket_context/ticket_currency_context/ticket_currency_context'
import { TariffType } from 'shared_components/types/tariffs'

export const getProposalType = (
  proposal: RawProposal,
  gates: Gates,
  validatingCarrier: string,
): ProposalType => {
  const airlineIatas = gates[proposal.gate_id] ? gates[proposal.gate_id].airline_iatas || [] : []
  const isAirline = airlineIatas.includes(validatingCarrier)
  return isAirline ? ProposalType.Airline : ProposalType.Proposal
}

export const getIsAssisted = (proposal: RawProposal, gates: Gates) =>
  !!(gates[proposal.gate_id] && gates[proposal.gate_id].assisted)

export const prepareTicketProposalsData = (
  ticketData: TicketData,
  gates: Gates,
  getDeeplink: (proposal: RawProposal) => string,
  airlineDeeplink: string,
  airlines: Airlines,
) => {
  const { tariffs } = ticketData
  const airlineWithoutPrice = getAirlineWithoutPrice(ticketData, airlineDeeplink, airlines)
  const hasBaggage = prepareProposals(
    tariffs.hasBaggage,
    ticketData,
    gates,
    getDeeplink,
    airlineWithoutPrice,
  )
  const otherBaggage = prepareProposals(
    tariffs.otherBaggage,
    ticketData,
    gates,
    getDeeplink,
    airlineWithoutPrice,
  )
  const cheaperTariffKey = tariffs.cheaperTariffKey as TariffType
  const airlineProposals = {
    [TariffType.HasBaggage]: removeMainButtonAirlineProposal(
      getHiddenTariffProposal(hasBaggage[1], otherBaggage[1], cheaperTariffKey) || hasBaggage[1],
      hasBaggage[0],
    ),
    [TariffType.OtherBaggage]: removeMainButtonAirlineProposal(otherBaggage[1], otherBaggage[0]),
  }
  const proposals: Proposals = {
    [TariffType.HasBaggage]: filterAirlineProposal(
      hasBaggage[0],
      airlineProposals[TariffType.HasBaggage],
    ),
    [TariffType.OtherBaggage]: isShouldHideOtherBaggageTab(cheaperTariffKey)
      ? []
      : filterAirlineProposal(otherBaggage[0], airlineProposals[TariffType.OtherBaggage]),
    priceDifference: tariffs.priceDifference,
  }
  const defaultTariff =
    proposals[cheaperTariffKey].length > 0
      ? cheaperTariffKey
      : cheaperTariffKey === TariffType.HasBaggage
      ? TariffType.OtherBaggage
      : TariffType.HasBaggage
  return {
    proposals,
    airlineProposals,
    cheaperTariffKey,
    defaultTariff,
  }
}

const removeMainButtonAirlineProposal = (
  airlineProposal: Proposal | AirlineWithoutPrice | null,
  [mainProposal]: Proposal[],
): Proposal | AirlineWithoutPrice | null => {
  if (airlineProposal && mainProposal && airlineProposal === mainProposal) {
    return null
  }
  return airlineProposal
}

const prepareProposals = (
  tariffs: RawProposal[],
  ticketData: TicketData,
  gates: Gates,
  getDeeplink: (proposal: RawProposal) => string,
  airlineWithoutPrice?: AirlineWithoutPrice,
): [Proposal[], Proposal | AirlineWithoutPrice | null] => {
  const { proposals } = tariffs.reduce(
    (acc: { readyKeys: object; proposals: Proposal[] }, tariff: RawProposal) => {
      // NOTE: make proposals unique by gate_id to prevent many unexpected tariffs by gates
      if (!acc.readyKeys[tariff.gate_id]) {
        const deeplink = getDeeplink(tariff)
        if (!deeplink) {
          return acc
        }
        const proposalType = getProposalType(tariff, gates, ticketData.validating_carrier)
        acc.readyKeys[tariff.gate_id] = true
        acc.proposals.push({
          price: tariff.price,
          currency: tariff.currency as Currency,
          unifiedPrice: tariff.unified_price,
          type: proposalType,
          isAssisted: getIsAssisted(tariff, gates),
          gateId: parseInt(tariff.gate_id, 10),
          proposalId: tariff.url,
          deeplink,
          worstBags: tariff.worstBags,
          debugProductivity: tariff.debugProductivity,
          debugMultiplier: tariff.debugMultiplier,
          debugProposalMultiplier: tariff.debugProposalMultiplier,
          gate: gates[tariff.gate_id],
          bags: tariff.bags,
          isCharter: tariff.is_charter,
        })
      }
      return acc
    },
    { readyKeys: {}, proposals: [] },
  )
  return [
    proposals,
    getAirlineProposal(proposals, ticketData.carriers) || airlineWithoutPrice || null,
  ]
}

const filterAirlineProposal = (
  proposals: Proposal[],
  airlineProposal: Proposal | AirlineWithoutPrice | null,
) => {
  if (!airlineProposal || airlineProposal.type === ProposalType.AirlineWithoutPrice) {
    return proposals
  }
  return proposals.filter((proposal) => proposal.proposalId !== airlineProposal.proposalId)
}

export const getVisibleProposalsCount = (
  isOpen: boolean,
  proposals: Proposal[],
  isShouldShowCredit: boolean,
  isAirlineProposalShown: boolean,
  seatsCount?: number | null,
): number => {
  if (isOpen) {
    return proposals.length
  }
  const isShowSeats = seatsCount && seatsCount <= MIN_SEATS_LEFT
  let count = MAX_VISIBLE_PROPOSALS
  if (isShowSeats) {
    count = count - 1
  }
  if (isShouldShowCredit) {
    count = count - 1
  }
  if (isAirlineProposalShown) {
    count = count - 1
  }
  return count
}

export const getAirlineWithoutPrice = (
  ticketData: TicketData,
  airlineDeeplink: string,
  airlines: Airlines,
): AirlineWithoutPrice | undefined => {
  const { validating_carrier: validatingCarrier, carriers } = ticketData
  const siteName = airlines[validatingCarrier] ? airlines[validatingCarrier].siteName : null
  // HACK: Dirty hack for S7 deeplink
  // Show deeplink for s7 only when just s7 operating of all flight
  if (!siteName || (validatingCarrier === 'S7' && carriers.length > 1) || !airlineDeeplink) {
    return undefined
  }
  return {
    siteName,
    type: ProposalType.AirlineWithoutPrice,
    deeplink: airlineDeeplink,
  }
}

export const getAirlineProposal = (proposals: Proposal[], carriers: string[]): Proposal | null =>
  proposals.find(({ type, gate }) => {
    const haveIntersection =
      gate && gate.airline_iatas && gate.airline_iatas.some((iata) => carriers.includes(iata))
    return haveIntersection || type === ProposalType.Airline
  }) || null

const isShouldHideOtherBaggageTab = (cheaperTariffKey: TariffType): boolean =>
  cheaperTariffKey === TariffType.HasBaggage

/*
  [SERP-993]
  Если вкладка с багажным тарифом дешевле, чем вкладка с безбагажным то её нужно скрыть,
  но попытаться достать из неё предложение от авиакомпании.
*/
export const getHiddenTariffProposal = (
  hasBaggageTariff: Proposal | AirlineWithoutPrice | null,
  otherBaggageTariff: Proposal | AirlineWithoutPrice | null,
  cheaperTariffKey: TariffType,
): Proposal | AirlineWithoutPrice | null => {
  // NOTE: Обычный кейс. Не нужно забирать предложение от а/к
  if (!isShouldHideOtherBaggageTab(cheaperTariffKey)) {
    return null
  }
  // NOTE: если нет предложения от а/к или оно без цены
  if (!otherBaggageTariff || otherBaggageTariff.type === ProposalType.AirlineWithoutPrice) {
    return null
  }
  if (!hasBaggageTariff) {
    return otherBaggageTariff
  }
  return null
}
