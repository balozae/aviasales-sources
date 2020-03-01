import React, { memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { ChangesOfAirport } from './ticket_stop.types'
import TicketBadgeComponent from '../ticket_badge/ticket_badge'
import { BadgeTypes } from '../ticket_badge/ticket_badge.types'
import { IconTypes } from '../ticket_icon/ticket_icon.types'
import { durationFormatter } from '../ticket.formatters'

import './ticket_stop.scss'

const cn = clssnms('ticket-stop')

export interface TicketStopProps {
  stopPlace: string
  delay: number
  hotelUrl?: string | null
  onHotelClick?: () => void
  visaCountry?: string | null
  changesOfAirport?: ChangesOfAirport | null
  isCompactView?: boolean
  isRecheckBaggage?: boolean
}

const TicketStop: React.FC<TicketStopProps> = ({
  stopPlace,
  delay,
  hotelUrl,
  onHotelClick,
  visaCountry,
  changesOfAirport,
  isCompactView = false,
  isRecheckBaggage,
}) => {
  const { t } = useTranslation('ticket')

  const hotelLinkClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (onHotelClick) {
        onHotelClick()
      }
    },
    [onHotelClick],
  )

  const hotetLink = hotelUrl ? (
    <a className={cn('hotel-link')} href={hotelUrl} target="blank" onClick={hotelLinkClick}>
      {t(`ticket:stops.hotelLink`)}
    </a>
  ) : null

  return (
    <div className={cn(null, { '--compact-view': isCompactView })}>
      <div className={cn('item', '--place')}>
        <div className={cn('badge-wrap')}>
          <TicketBadgeComponent
            type={BadgeTypes.Icon}
            valueKey={IconTypes.RunningMen}
            valueType="info"
          />
        </div>
        <div className={cn('place')}>{t(`ticket:stops.transfer`, { place: stopPlace })}</div>
        <div className={cn('additional-inner')}>
          {hotetLink}
          <div className={cn('time')}>{durationFormatter(delay)}</div>
        </div>
      </div>
      {visaCountry && (
        <div className={cn('item', '--stopover-visa')}>
          <div className={cn('badge-wrap')}>
            <TicketBadgeComponent
              type={BadgeTypes.Icon}
              valueKey={IconTypes.Visa}
              valueType="warning"
            />
          </div>
          {t(`ticket:stops.needVisa`, {
            country: t(`ticket:visaCountries.${visaCountry}`),
          })}
        </div>
      )}
      {changesOfAirport && (
        <div className={cn('item', '--change-airport')}>
          <div className={cn('badge-wrap')}>
            <TicketBadgeComponent
              type={BadgeTypes.Icon}
              valueKey={IconTypes.Change}
              valueType="warning"
            />
          </div>
          {t(`ticket:stops.changeOfAirport`, { airports: changesOfAirport.join('-') })}
        </div>
      )}
      {isRecheckBaggage && (
        <div className={cn('item', '--recheck-baggage')}>
          <div className={cn('badge-wrap')}>
            <TicketBadgeComponent
              type={BadgeTypes.Icon}
              valueKey={IconTypes.RecheckBaggage}
              valueType="warning"
            />
          </div>
          {t(`ticket:stops.recheckBaggage`)}
        </div>
      )}
    </div>
  )
}

export default memo(TicketStop)
