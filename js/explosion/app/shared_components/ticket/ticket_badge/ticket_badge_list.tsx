import React from 'react'
import clssnms from 'clssnms'
import TicketBadge, { TicketBadgeProps } from './ticket_badge'

import './ticket_badge_list.scss'

const cn = clssnms('ticket-badge-list')

export interface TicketBadgeListProps {
  badges: TicketBadgeProps[]
  onTooltip?: TicketBadgeProps['onTooltip']
  modifiers?: string[]
}

const TicketBadgeList: React.FunctionComponent<TicketBadgeListProps> = ({
  badges,
  onTooltip,
  modifiers = [],
}) => {
  if (!badges || !badges.length) {
    return null
  }

  return (
    <ul className={cn(null, modifiers)}>
      {badges.map((badge, i) => (
        <li key={badge.valueKey + i} className={cn('item')}>
          <TicketBadge onTooltip={onTooltip} {...badge} />
        </li>
      ))}
    </ul>
  )
}

export default React.memo(TicketBadgeList)
