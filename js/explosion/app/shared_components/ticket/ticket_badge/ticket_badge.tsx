import React, { memo, useContext } from 'react'
import clssnms from 'clssnms'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import { BadgeTypes } from './ticket_badge.types'
import TicketIcon from '../ticket_icon/ticket_icon'
import { IconColors, IconTypes } from '../ticket_icon/ticket_icon.types'

import './ticket_badge.scss'

export interface TicketBadgeProps {
  type: BadgeTypes
  valueKey: IconTypes | string
  tooltipTextKey?: string
  tooltipTextGenerator?: (t: i18next.TFunction) => string
  valueType?: 'warning' | 'info' | 'default'
  onTooltip?: (key: string) => void
}

const cn = clssnms('ticket-badge')

const TicketBadgeComponent = ({
  type,
  valueKey,
  tooltipTextKey,
  tooltipTextGenerator,
  valueType,
  onTooltip,
}: TicketBadgeProps) => {
  const { t } = useTranslation('ticket')

  if (type === BadgeTypes.Text && !i18next.exists(`ticket:badges.${valueKey}`)) {
    return null
  }

  const badgeClassName = cn(null, { [`--${type}`]: !!type, [`--${valueType}`]: !!valueType })

  // badge content
  let content: React.ReactNode
  if (type === BadgeTypes.Icon) {
    let iconColor = IconColors.Blue
    if (valueType === 'warning') {
      iconColor = IconColors.Red
    } else if (valueType === 'info') {
      iconColor = IconColors.Grey
    }
    content = <TicketIcon type={valueKey as IconTypes} color={iconColor} className={cn('icon')} />
  } else {
    content = <span className={cn('text')}>{t(`ticket:badges.${valueKey}`)}</span>
  }

  // badge with tooltip
  if (
    (tooltipTextKey && i18next.exists(`ticket:badges.${tooltipTextKey}`)) ||
    tooltipTextGenerator
  ) {
    let tooltipText: string
    if (tooltipTextGenerator) {
      tooltipText = tooltipTextGenerator(t)
    } else {
      tooltipText = t(`ticket:badges.${tooltipTextKey}`)
    }
    return (
      <Tooltip
        tooltip={() => <div className={cn('tooltip')}>{tooltipText}</div>}
        wrapperClassName={badgeClassName}
        showingCallback={() => onTooltip && tooltipTextKey && onTooltip(tooltipTextKey)}
      >
        {content}
      </Tooltip>
    )
  }

  // just badge
  return <div className={badgeClassName}>{content}</div>
}

export default memo(TicketBadgeComponent)
