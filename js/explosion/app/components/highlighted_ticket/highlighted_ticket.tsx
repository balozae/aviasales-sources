import React, { memo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import { ErrorType } from 'shared_components/error_boundary/error_boundary.types'
import { TicketMediaQueryTypes } from 'shared_components/ticket/ticket.types'
import defaultResizer, { useResizerOnEnter } from 'shared_components/resizer'
import { ProductListProps } from 'components/product_list/product_list'
import AllTicketsIconSVG from '!!react-svg-loader!./all_tickets.svg'
import ProductTicket from 'components/product_list/product_ticket'
import { getPriceClassName } from './highlighted_ticket.utils'
import HighlightedTicketPlateText from './plate_text'
import { HighlightedTicketParams } from 'common/js/redux/types/highlighted_ticket_params.types'
import { removeHighlightedTicketParams } from 'common/js/redux/actions/highlighted_ticket_params.actions'
import { hideBlackOverlay } from 'common/js/redux/actions/is_black_overlay_shown.actions'
import { removeBodyClass } from 'common/js/redux/actions/body_class.actions'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

import './highlighted_ticket.scss'

const cn = clssnms('highlighted-ticket')
const HIGHLIGHTED_TICKET_BODY_CLASS = 'is-highlighted-ticket'

const mediaQueryModesMapping = {
  mobile: TicketMediaQueryTypes.Mobile,
  mobileLandscape: TicketMediaQueryTypes.Mobile,
  tablet: TicketMediaQueryTypes.Desktop,
  desktop: TicketMediaQueryTypes.Desktop,
}
const initialMediaQueryType = mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop']

interface HighlightedTicketOwnProps {
  ticket: TicketTuple
  highlightedTicketParams: HighlightedTicketParams
  isSearchFinished: boolean
  scheduleTickets: ProductListProps['scheduleTickets']
  selectedScheduleTickets: ProductListProps['selectedScheduleTickets']
}

interface HighlightedTicketDispatchProps {
  reachGoal: (name: string, data: any) => void
  removeHighlightedTicketParams: () => void
  removeBodyClass: (className: string) => void
  hideBlackOverlay: () => void
}

export type HighlightedTicketProps = HighlightedTicketOwnProps & HighlightedTicketDispatchProps

const HighlightedTicket: React.FC<HighlightedTicketProps> = memo((props) => {
  const [ticketData, proposals] = props.ticket || [props.highlightedTicketParams, []]
  const [mainProposal] = proposals
  const ticketPrice = mainProposal ? mainProposal.unified_price : undefined
  const expectedPrice = props.highlightedTicketParams.price || undefined

  const [withOverlay, setWithOverlay] = useState(true)
  const { t } = useTranslation('highlighted_ticket')
  const [mediaQueryType, setMediaQueryType] = useState(initialMediaQueryType)
  const hanleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    setMediaQueryType(mediaQueryModesMapping[meadiaQueryKey])
  }
  useResizerOnEnter(hanleMediaQueryTypeChange)

  const reachGoal = (event: string, data?: any) => {
    data = Object.assign({}, data, props.highlightedTicketParams.reachGoalData)
    props.reachGoal(`highlighted_ticket--${event}`, data)
  }

  useEffect(() => {
    reachGoal('showed')
  }, [])

  const handleCloseClick = (event: React.MouseEvent) => {
    event.preventDefault()
    props.removeHighlightedTicketParams()
    reachGoal('closed')
  }

  const handleShowAllTicketsClick = (event: React.MouseEvent) => {
    event.preventDefault()
    setWithOverlay(false)
    props.removeBodyClass(HIGHLIGHTED_TICKET_BODY_CLASS)
    props.hideBlackOverlay()
    reachGoal('closed')
  }

  const plateClass = getPriceClassName(
    props.isSearchFinished,
    expectedPrice,
    ticketPrice,
    !props.ticket,
  )

  return (
    <ErrorBoundary errorType={ErrorType.Error}>
      <div className={cn()}>
        <div
          className={cn('container', {
            [plateClass]: !!plateClass,
            '--not-found': !props.ticket,
            '--no-overlay': !withOverlay,
          })}
        >
          {props.isSearchFinished && <div className={cn('close')} onClick={handleCloseClick} />}
          <div className={cn('plate')}>
            <div className={cn('plate-text')}>
              <HighlightedTicketPlateText
                ticketPrice={ticketPrice}
                expectedPrice={expectedPrice}
                isSearchFinished={props.isSearchFinished}
                isNotFound={!props.ticket}
              />
            </div>
          </div>
          <div className={cn('ticket')}>
            <ProductTicket
              key={ticketData.sign}
              ticketIndex={0}
              originalTicket={[ticketData, proposals]}
              reachGoalData={props.highlightedTicketParams.reachGoalData}
              mediaQueryType={mediaQueryType}
              scheduleTicketsMap={props.scheduleTickets}
              selectedScheduleTickets={props.selectedScheduleTickets}
              hideIncomingBadge={true}
            />
          </div>
          {withOverlay && (
            <div className={cn('highlighted-link')} onClick={handleShowAllTicketsClick}>
              <AllTicketsIconSVG className={cn('link-icon')} />
              {t('highlighted_ticket:showAllTickets')}
            </div>
          )}
        </div>
        {withOverlay && <div className={cn('overlay')} onClick={handleShowAllTicketsClick} />}
      </div>
    </ErrorBoundary>
  )
})

const mapDispatchToProps = (dispatch) => ({
  reachGoal: (name: string, data: any) => dispatch(reachGoal(name, data)),
  removeHighlightedTicketParams: () => dispatch(removeHighlightedTicketParams()),
  hideBlackOverlay: () => dispatch(hideBlackOverlay()),
  removeBodyClass: (className: string) => dispatch(removeBodyClass(className)),
})

export default connect<null, HighlightedTicketDispatchProps>(
  null,
  mapDispatchToProps,
)(HighlightedTicket)
