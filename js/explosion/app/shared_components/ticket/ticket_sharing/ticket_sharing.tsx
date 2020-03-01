import React, { memo, useState, useRef, useCallback } from 'react'
import { TicketSharingsSocials } from './ticket_sharing.utils'
import { TicketMediaQueryTypes } from '../ticket.types'
import TicketSharingDesktop from './ticket_sharing.desktop'
import TicketSharingMobile from './ticket_sharing.mobile'
import copyToClipboard from 'copy-to-clipboard'

export interface TicketSharingProps {
  ticketUrl: string
  onTooltipShow?: () => void
  onTicketUrlCopy?: (isCopyCommandSupported: boolean) => void
  onTicketShare?: (network: TicketSharingsSocials) => void
  mediaQueryType?: TicketMediaQueryTypes
}

export type TicketSharingInputRef = HTMLInputElement

const TicketSharing: React.FC<TicketSharingProps> = memo((props) => {
  const [isTicketUrlCopied, setIsTicketUrlCopied] = useState(false)
  const [isTicketUrlCopyFailed, setIsTicketUrlCopyFailed] = useState(false)
  const inputElementRef: React.RefObject<TicketSharingInputRef> = useRef(null)

  const handleTicketUrlCopy = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      const inputElement = inputElementRef.current
      if (inputElement) {
        const isSuccessfull = copyToClipboard(props.ticketUrl)

        if (isSuccessfull) {
          setIsTicketUrlCopied(true)
          if (props.onTicketUrlCopy) {
            props.onTicketUrlCopy(true)
          }
        } else {
          setIsTicketUrlCopyFailed(true)
          if (props.onTicketUrlCopy) {
            props.onTicketUrlCopy(false)
          }
        }
      }
    },
    [
      inputElementRef,
      props.ticketUrl,
      props.onTicketUrlCopy,
      setIsTicketUrlCopied,
      setIsTicketUrlCopyFailed,
    ],
  )

  if (props.mediaQueryType === TicketMediaQueryTypes.Mobile) {
    return (
      <TicketSharingMobile
        ref={inputElementRef}
        isTicketUrlCopied={isTicketUrlCopied}
        isTicketUrlCopyFailed={isTicketUrlCopyFailed}
        ticketUrl={props.ticketUrl}
        handleTicketUrlCopy={handleTicketUrlCopy}
        onTooltipShow={props.onTooltipShow}
        onTicketShare={props.onTicketShare}
      />
    )
  }

  return (
    <TicketSharingDesktop
      ref={inputElementRef}
      isTicketUrlCopied={isTicketUrlCopied}
      isTicketUrlCopyFailed={isTicketUrlCopyFailed}
      ticketUrl={props.ticketUrl}
      handleTicketUrlCopy={handleTicketUrlCopy}
      setIsTicketUrlCopied={setIsTicketUrlCopied}
      onTooltipShow={props.onTooltipShow}
      onTicketShare={props.onTicketShare}
    />
  )
})

export default TicketSharing
