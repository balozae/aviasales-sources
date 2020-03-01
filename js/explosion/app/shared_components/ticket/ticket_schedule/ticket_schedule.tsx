import React, { useMemo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { timeFormatter } from '../ticket.formatters'
import TicketPrice from '../ticket_price/ticket_price'

import './ticket_schedule.scss'
import { TripTransport } from '../ticket.types'

const cn = clssnms('ticket-schedule')

export interface TicketScheduleItem {
  time: [number, number]
  unifiedPrice: number
  sign: string
}

export interface TicketScheduleProps {
  schedule: ReadonlyArray<TicketScheduleItem>
  ticketTransportType: TripTransport
  selectedScheduleSign?: string
  onScheduleClick?: (sign: string) => void
}

const TicketSchedule: React.SFC<TicketScheduleProps> = (props) => {
  const { t } = useTranslation('ticket')

  const minPrice = props.schedule.reduce(
    (min, { unifiedPrice }) => Math.min(min, unifiedPrice),
    props.schedule[0].unifiedPrice,
  )

  const title =
    props.ticketTransportType === 'airplane' ? t('ticket:pickTimeAirplane') : t('ticket:pickTime')

  const handleScheduleClick = (sign: string) => (event: React.MouseEvent) => {
    event.stopPropagation()
    if (props.onScheduleClick) {
      props.onScheduleClick(sign)
    }
  }

  return (
    <div className={cn()}>
      <div className={cn('title')}>{title}:</div>
      <div className={cn('items-wrap')}>
        {props.schedule.map(({ time, unifiedPrice, sign }) => {
          const [departure, arrival] = [timeFormatter(time[0]), timeFormatter(time[1])]
          return (
            <div
              data-testid={`schedule-time-${sign}`}
              className={cn('item', {
                '--is-selected': sign === props.selectedScheduleSign,
              })}
              key={sign}
              onClick={handleScheduleClick(sign)}
            >
              <span>{t('ticket:dateTime.timeInterval', { from: departure, to: arrival })}</span>
              <p className={cn('price', { '--min-price': unifiedPrice <= minPrice })}>
                <TicketPrice valueInRubles={unifiedPrice} />
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TicketSchedule
