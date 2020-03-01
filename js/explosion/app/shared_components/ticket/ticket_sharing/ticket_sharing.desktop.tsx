import React, { memo, useCallback, useState, useRef, useEffect } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import sharings, { TicketSharingsSocials } from './ticket_sharing.utils'
import Tooltip from 'shared_components/tooltip'
import { CSSTransition } from 'react-transition-group'
import { TicketSharingProps, TicketSharingInputRef } from './ticket_sharing'

const IconShare = require('!!react-svg-loader!./images/icon-share.svg')
const IconClose = require('!!react-svg-loader!common/images/icon-close.svg')

import './ticket_sharing.desktop.scss'

const cn = clssnms('ticket-sharing-desktop')

export interface TicketSharingDesktopProps {
  ticketUrl: TicketSharingProps['ticketUrl']
  isTicketUrlCopied: boolean
  isTicketUrlCopyFailed: boolean
  handleTicketUrlCopy: (event: React.MouseEvent) => void
  setIsTicketUrlCopied: (isCopied: boolean) => void
  onTooltipShow?: TicketSharingProps['onTooltipShow']
  onTicketShare?: TicketSharingProps['onTicketShare']
}

const TicketSharingDesktop = React.forwardRef<TicketSharingInputRef, TicketSharingDesktopProps>(
  (props, inputElementRef) => {
    const { t } = useTranslation('ticket')
    const [isBarOpen, setIsBarOpen] = useState(false)
    const shareElementRef: React.RefObject<HTMLDivElement> = useRef(null)

    const handleWindowClick = (e: MouseEvent) => {
      if (shareElementRef.current && shareElementRef.current.contains(e.target as Node)) {
        return
      }
      setIsBarOpen(false)
    }

    const toggleBar = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()
        if (!isBarOpen && props.onTooltipShow) {
          props.onTooltipShow()
        }
        setIsBarOpen(!isBarOpen)
      },
      [isBarOpen, setIsBarOpen, props.onTooltipShow],
    )

    const handleCopyBtnMouseLeave = useCallback(() => props.setIsTicketUrlCopied(false), [
      props.setIsTicketUrlCopied,
    ])

    useEffect(
      () => {
        if (isBarOpen) {
          window.addEventListener('click', handleWindowClick)
        }
        return () => {
          window.removeEventListener('click', handleWindowClick)
        }
      },
      [isBarOpen, handleWindowClick],
    )

    const getTooltip = (textKey: string) => () => (
      <span className={cn('tooltip')}>{t(`ticket:sharing.desktop.${textKey}`)}</span>
    )

    return (
      <CSSTransition
        classNames={{ enterActive: '--is-opening', enterDone: '--is-open' }}
        in={isBarOpen}
        timeout={700}
      >
        <div className={cn()} ref={shareElementRef}>
          <button type="button" className={cn('open-button')} onClick={toggleBar}>
            <IconShare className={cn('share-icon')} onClick={toggleBar} />
          </button>
          <button type="button" className={cn('close-button')} onClick={toggleBar}>
            <IconClose className={cn('close-icon')} />
          </button>
          <div className={cn('bar')}>
            <div className={cn('bar-content')}>
              <div className={cn('list')}>
                {Object.values(TicketSharingsSocials).map((network: TicketSharingsSocials) => (
                  <Tooltip
                    key={network}
                    className={cn('tooltip')}
                    wrapperClassName={cn('list-item')}
                    tooltip={getTooltip(network)}
                    showDelay={200}
                    position={'top'}
                    fixPosition={{ top: -5 }}
                  >
                    <SocialButton
                      network={network}
                      text={t('ticket:sharingText')}
                      title={t(`ticket:sharing.desktop.${network}`)}
                      onTicketShare={props.onTicketShare}
                      ticketUrl={props.ticketUrl}
                    />
                  </Tooltip>
                ))}

                <div className={cn('list-item')}>
                  {!props.isTicketUrlCopyFailed && (
                    <Tooltip
                      tooltip={getTooltip(props.isTicketUrlCopied ? 'copyDone' : 'copy')}
                      showDelay={200}
                      position={'top'}
                      fixPosition={{ top: -5 }}
                    >
                      <button
                        onMouseLeave={handleCopyBtnMouseLeave}
                        className={cn('share-button', '--share-link')}
                        onClick={props.handleTicketUrlCopy}
                        type="button"
                      />
                    </Tooltip>
                  )}
                  <input
                    className={cn('input', { 'is-hidden': !props.isTicketUrlCopyFailed })}
                    type="url"
                    readOnly={true}
                    value={props.ticketUrl}
                    ref={inputElementRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
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
      className={cn('share-button', [`--${props.network}`])}
      onClick={handleSocialClick}
      title={props.title}
      type="button"
    />
  )
})

export default memo(TicketSharingDesktop)
