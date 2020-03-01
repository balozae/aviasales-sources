import React, { memo, useCallback, useEffect } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import sharings, { TicketSharingsSocials } from './ticket_sharing.utils'
import { TicketSharingProps, TicketSharingInputRef } from './ticket_sharing'

import './ticket_sharing.mobile.scss'

const cn = clssnms('ticket-sharing-mobile')

export interface TicketSharingMobileProps {
  ticketUrl: TicketSharingProps['ticketUrl']
  isTicketUrlCopied: boolean
  isTicketUrlCopyFailed: boolean
  handleTicketUrlCopy: (event: React.MouseEvent) => void
  onTooltipShow?: TicketSharingProps['onTooltipShow']
  onTicketShare?: TicketSharingProps['onTicketShare']
}

const TicketSharingMobile = React.forwardRef<TicketSharingInputRef, TicketSharingMobileProps>(
  (props, inputElementRef) => {
    const { t } = useTranslation('ticket')

    useEffect(() => {
      if (props.onTooltipShow) {
        props.onTooltipShow()
      }
    }, [])

    return (
      <div className={cn('')}>
        <ul className={cn('list')}>
          {Object.values(TicketSharingsSocials).map((network: TicketSharingsSocials) => (
            <li key={network} className={cn('list-item')}>
              <SocialButton
                network={network}
                text={t('ticket:sharingText')}
                title={t(`ticket:sharing.mobile.${network}`)}
                onTicketShare={props.onTicketShare}
                ticketUrl={props.ticketUrl}
              />
            </li>
          ))}

          <li className={cn('list-item')}>
            {!props.isTicketUrlCopyFailed && (
              <button
                className={cn('share-button', [
                  '--share-link',
                  props.isTicketUrlCopied && '--copied',
                ])}
                onClick={props.handleTicketUrlCopy}
                type="button"
              >
                <i className={cn('share-button-icon')} />
                <p className={cn('share-button-label')}>
                  {t(`ticket:sharing.mobile.${props.isTicketUrlCopied ? 'copyDone' : 'copy'}`)}
                </p>
              </button>
            )}
            <input
              className={cn('input', { 'is-hidden': !props.isTicketUrlCopyFailed })}
              type="url"
              readOnly={true}
              value={props.ticketUrl}
              ref={inputElementRef}
            />
          </li>
        </ul>
      </div>
    )
  },
)

const SocialButton: React.FC<{
  network: TicketSharingsSocials
  ticketUrl: TicketSharingProps['ticketUrl']
  text: string
  title: string
  onTicketShare: TicketSharingProps['onTicketShare']
}> = memo((props) => {
  const handleSocialClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      sharings[props.network]({ url: props.ticketUrl, text: props.text })
      if (props.onTicketShare) {
        props.onTicketShare(props.network)
      }
    },
    [props.network, props.ticketUrl, props.text, props.onTicketShare],
  )

  return (
    <button
      className={cn('share-button', `--${props.network}`)}
      onClick={handleSocialClick}
      type="button"
    >
      <i className={cn('share-button-icon')} />
      <p className={cn('share-button-label')}>{props.title}</p>
    </button>
  )
})

export default memo(TicketSharingMobile)
