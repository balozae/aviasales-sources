import React, { memo, useCallback } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { Hotel, Passengers } from '../ticket_incoming_data.types'
import { TicketSegment, Proposal, Dirty } from '../ticket.types'
import { diff } from 'finity-js'

import './ticket_hotel_info.scss'

const cn = clssnms('ticket-hotel-info')

export interface TicketHotelInfoProps {
  hotel: Hotel
  segments: TicketSegment[]
  deeplink?: string
  passengers: Passengers
  mainProposal?: Proposal
  onDeeplinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, proposal: Dirty<Proposal>) => void
  getMetaInfo: (proposal?: Proposal) => void
}

const TicketHotelInfo: React.FC<TicketHotelInfoProps> = ({
  hotel,
  segments,
  deeplink,
  passengers,
  mainProposal,
  onDeeplinkClick,
  getMetaInfo,
}) => {
  const duration = getDuration(segments)
  const passengersCount = Object.values(passengers).reduce((a, b) => a + b)

  const handleDeeplinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.stopPropagation()
      if (onDeeplinkClick && mainProposal) {
        onDeeplinkClick(e, mainProposal)
      }
    },
    [onDeeplinkClick, mainProposal],
  )

  if (!hotel || !deeplink || !duration) {
    return null
  }

  const { t } = useTranslation('ticket')
  const region = hotel.region ? `, ${hotel.region.city}` : ''
  const name = hotel.name + region
  const durationText = t('ticket:dateTime.nights', {
    days: duration,
  })
  const passengersText = t(`ticket:hotelInfo.man`, {
    count: passengersCount,
  })
  const boardTitle = hotel.board_title ? `, ${hotel.board_title}` : ''

  const metaInfo = JSON.stringify(mainProposal ? getMetaInfo(mainProposal) : getMetaInfo())

  return (
    <div className={cn()}>
      <a
        href={deeplink}
        className={cn('link')}
        onClick={handleDeeplinkClick}
        data-metainfo={metaInfo}
      >
        {name}
      </a>
      <div className={cn('stars')}>
        {new Array(hotel.stars).fill(null).map((_, key) => (
          <i key={key} className={cn('star')} />
        ))}
      </div>
      <div className={cn('supply')}>
        {durationText}
        {boardTitle}
      </div>
      <div className={cn('supply')}>
        {t(`ticket:hotelInfo.description`, { passengers: passengersText })}
      </div>
    </div>
  )
}

const getDuration = (segments: TicketSegment[]): number | undefined => {
  if (segments[0] && segments[1]) {
    return Math.abs(
      diff(
        new Date(segments[0].route[0].arrival_date),
        new Date(segments[1].route[0].departure_date),
      ),
    )
  }
}

export default memo(TicketHotelInfo)
