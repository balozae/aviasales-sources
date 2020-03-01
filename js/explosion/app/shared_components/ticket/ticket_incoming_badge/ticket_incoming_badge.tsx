import React, { memo } from 'react'
import clssnms from 'clssnms'
import Tooltip from 'shared_components/tooltip'
import { IncomingBadge } from '../ticket_incoming_data.types'

import './ticket_incoming_badge.scss'

export type TicketIncomingBadgeProps = IncomingBadge & {
  isFullView?: boolean
}

const cn = clssnms('ticket-incoming-badge')

const TicketIncomingBadge: React.FC<TicketIncomingBadgeProps> = ({
  type,
  title,
  description,
  color,
  meta,
  isFullView = false,
}) => {
  const badgeClassName = cn('', { [`--${type}`]: !!type, [`--full-view`]: isFullView })
  const badgeStyles = {
    backgroundColor: color,
  }
  const label = <span className={cn('label')}>{title}</span>

  if (isFullView && description) {
    return (
      <div className={badgeClassName} style={badgeStyles}>
        {description}
      </div>
    )
  }

  // badge with tooltip
  if (description) {
    return (
      <Tooltip
        tooltip={() => <div className={cn('tooltip')}>{description}</div>}
        wrapperClassName={badgeClassName}
        wrapperProps={{ style: badgeStyles }}
      >
        {label}
      </Tooltip>
    )
  }

  // just badge
  return (
    <div className={badgeClassName} style={badgeStyles}>
      {label}
    </div>
  )
}

export default memo(TicketIncomingBadge)
