import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import clssnms from 'clssnms'

import './ticket_subscriptions.scss'

const Icon = require('!!react-svg-loader!./ticket_subscriptions.svg')

const cn = clssnms('ticket-subscriptions')

interface TicketSubscriptionsProps {
  sign?: string
  hasSubscription?: boolean
  onSubscriptionClick?: (onSubscriptionClick: boolean, sign?: string) => void
  withTooltip?: boolean
}

const TicketSubscriptions: React.FC<TicketSubscriptionsProps> = ({
  sign,
  hasSubscription,
  onSubscriptionClick,
  withTooltip = true,
}) => {
  const { t } = useTranslation('ticket')
  const tooltipText = hasSubscription
    ? t(`ticket:subscriptionTooltip.remove`)
    : t(`ticket:subscriptionTooltip.add`)

  const tooltipContent = useCallback(() => <div className={cn('tooltip')}>{tooltipText}</div>, [
    tooltipText,
  ])

  const handleSubscribeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (onSubscriptionClick) {
        onSubscriptionClick(!!hasSubscription, sign)
      }
    },
    [hasSubscription, onSubscriptionClick, sign],
  )

  const tooltipVisibilityProps = withTooltip
    ? {}
    : {
        showByProps: true,
        isVisible: false,
      }

  return (
    <Tooltip
      wrapperClassName={cn(null, { '--is-active': !!hasSubscription })}
      tooltip={tooltipContent}
      {...tooltipVisibilityProps}
    >
      <button onClick={handleSubscribeClick} className={cn('button')}>
        <Icon className={cn('icon')} />
      </button>
    </Tooltip>
  )
}

export default React.memo(TicketSubscriptions)
