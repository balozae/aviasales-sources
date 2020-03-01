import i18next from 'i18next'
import { TicketBadgeProps } from '../ticket_badge/ticket_badge'
import { BadgeTypes } from '../ticket_badge/ticket_badge.types'
import { IconTypes } from '../ticket_icon/ticket_icon.types'
import { TicketData, Segment } from '../ticket_incoming_data.types'
import {
  isTrain,
  isFullyTrain,
  isBus,
  isAirportChange,
  isNightStop,
  isLongStop,
  isAirportDifferent,
  isUncomfortableChairs,
  isFullyBus,
  isNeedVisaCountries,
  isRecheckBaggage,
} from './ticket_common.utils'
import { FlightInfo } from '../ticket.types'

const SHORT_STOP = 45
const VERY_SHORT_STOP = 20

// isShortStop
const isShortStop = (minStopDuration?: number | null): boolean => {
  if (!minStopDuration) {
    return false
  }
  return minStopDuration > VERY_SHORT_STOP && minStopDuration <= SHORT_STOP
}

// isVeryShortStop
const isVeryShortStop = (minStopDuration?: number | null): boolean => {
  if (!minStopDuration) {
    return false
  }
  return minStopDuration < VERY_SHORT_STOP
}

// getTooltipText for specific case:
// when ticket different transports
const getTooltipText = (ticket: TicketData) => (t: i18next.TFunction): string => {
  const wayType = isFullyTrain(ticket) || isFullyBus(ticket) ? 'all_way' : 'part_way'
  const keyParts = [`ticket:badges.transport.${wayType}`, 'by']
  const transportParts: string[] = []
  if (isBus(ticket)) {
    transportParts.push('bus')
  }
  if (isTrain(ticket)) {
    transportParts.push('train')
  }
  keyParts.push(transportParts.join('and'))
  return t(keyParts.join('_'))
}

export interface PrepareBadgesDataInterface {
  ticket: TicketData
  segment: Segment
  isCharter: boolean
  flightInfo?: FlightInfo
}

export const prepareBadgesData = ({
  ticket,
  isCharter,
  flightInfo,
}: PrepareBadgesDataInterface): TicketBadgeProps[] => {
  const badges: TicketBadgeProps[] = []

  if (isCharter) {
    badges.push({
      type: BadgeTypes.Text,
      valueKey: 'charter',
      tooltipTextKey: 'charter',
    })
  }

  if (isTrain(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Train,
      tooltipTextGenerator: getTooltipText(ticket),
    })
  }

  if (isBus(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Bus,
      tooltipTextGenerator: getTooltipText(ticket),
    })
  }

  if (isAirportChange(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Change,
      tooltipTextKey: 'airport_change',
      valueType: 'warning',
    })
  }

  if (isNightStop(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Moon,
      tooltipTextKey: 'night_stop',
      valueType: 'warning',
    })
  }

  if (isLongStop(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Time,
      tooltipTextKey: 'transfer_long',
      valueType: 'warning',
    })
  }

  if (isRecheckBaggage(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.RecheckBaggage,
      tooltipTextKey: 'recheck_baggage',
      valueType: 'warning',
    })
  }

  // TODO check segments
  if (ticket.hotel) {
    badges.push({
      type: BadgeTypes.Text,
      valueKey: 'tour_ticket',
      tooltipTextKey: 'tour_ticket',
    })
  }

  if (isAirportDifferent(ticket)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.DifferentAirport,
      tooltipTextKey: 'airport_arrival_departure_difference',
      valueType: 'warning',
    })
  }

  // isVeryShortStop || isShortStop
  if (isVeryShortStop(ticket.min_stop_duration)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.RunningMen,
      tooltipTextKey: 'transfer_very_short',
      valueType: 'warning',
    })
  } else if (isShortStop(ticket.min_stop_duration)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.RunningMen,
      tooltipTextKey: 'transfer_short',
      valueType: 'warning',
    })
  }

  // isUncomfortableChairs
  if (isUncomfortableChairs(ticket, flightInfo)) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Chair,
      tooltipTextKey: 'chair_pitch',
      valueType: 'warning',
    })
  }

  if (isNeedVisaCountries(ticket).length) {
    badges.push({
      type: BadgeTypes.Icon,
      valueKey: IconTypes.Visa,
      tooltipTextKey: 'needVisa',
      valueType: 'warning',
    })
  }

  return badges
}

export type SplitedBadges = { [key: string]: TicketBadgeProps[] }
export const splitBadgesByValueType = (badges: TicketBadgeProps[]): SplitedBadges => {
  return badges.reduce((acc, badge) => {
    let key = 'other'
    if (badge.valueType) {
      key = badge.valueType
    }
    acc[key] = [...(acc[key] || []), badge]
    return acc
  }, {})
}
