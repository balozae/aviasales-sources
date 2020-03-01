import React, { memo } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'

const cn = clssnms('buy-button')

const AssistedTooltip: React.FC = memo(() => {
  const { t } = useTranslation('ticket')
  return (
    <div className={cn('assisted-tooltip')} data-testid="assisted-tooltip">
      <span className={cn('assisted-tooltip-title')}>
        <svg className={cn('assisted-tooltip-icon')} width={7} height={12}>
          <path fill="#fff" fillRule="nonzero" d="M4.722 0L0 6.944h2.917l-1.111 5L6.666 5H3.75z" />
        </svg>
        {t(`ticket:buyButton.assistedTitle`)}
      </span>
      <span className={cn('assisted-tooltip-text')}>{t(`ticket:buyButton.assistedText`)}</span>
    </div>
  )
})

export default AssistedTooltip
