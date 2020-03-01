import React, { memo, useState, useCallback } from 'react'
import clssnms from 'clssnms'
import { BrandTicketProps } from './brand_ticket.types'
import TicketPreview from '../ticket_preview/ticket_preview'

const cn = clssnms('ticket-mobile')

const BrandTicketMobile = memo((props: BrandTicketProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handlePreviewClick = useCallback(
    () => {
      props.onTicketClick(!isOpen)
      setIsOpen(!isOpen)
    },
    [props.onTicketClick, setIsOpen, isOpen],
  )

  return (
    <div
      className={cn(null, ['--brand-ticket', isOpen && '--is-opened', ...props.modifiers])}
      onClick={handlePreviewClick}
    >
      <TicketPreview
        mainProposal={props.mainProposal}
        carriers={props.carriers}
        segments={props.segments}
        isNightMode={props.isNightMode}
        theme={props.theme}
      />
    </div>
  )
})

export default BrandTicketMobile
