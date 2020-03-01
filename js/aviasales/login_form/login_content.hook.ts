import { useMemo } from 'react'
import { LoginFormContentProps } from './login_form'

import { useTranslation } from 'react-i18next'
import { LoginPopupContainerProps } from 'login_popup'

const DefaultImage = require('!!react-svg-loader!./images/default.svg')
const TicketSubscriptionImage = require('!!react-svg-loader!./images/ticket_subscription.svg')

export type LoginFormType = LoginPopupContainerProps['from']

const useLoginContent = (type?: LoginFormType): LoginFormContentProps => {
  const { t } = useTranslation('login_form')
  return useMemo<LoginFormContentProps>(
    () => {
      switch (type) {
        case 'direction-subscription':
          return {
            image: TicketSubscriptionImage,
            title: t('direction_subscription.title'),
          }
        case 'ticket-subscription':
          return {
            image: TicketSubscriptionImage,
            title: t('ticket_subscription.title'),
            description: t('ticket_subscription.description', { defaultValue: null }),
            caption: t('ticket_subscription.caption', { defaultValue: null }),
          }
        default:
          return {
            image: DefaultImage,
            title: t('default.title'),
            description: t('default.description', { defaultValue: null }),
            caption: t('default.caption', { defaultValue: null }),
          }
      }
    },
    [type, t],
  )
}

export default useLoginContent
