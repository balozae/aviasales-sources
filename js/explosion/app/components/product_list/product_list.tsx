import React, { memo, useState } from 'react'
import clssnms from 'clssnms'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { TicketMediaQueryTypes } from 'shared_components/ticket/ticket.types'
import AdContainer from 'components/ad_container/ad_container'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import { ErrorType } from 'shared_components/error_boundary/error_boundary.types'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { ScheduleTicketsIterator } from 'common/js/redux/types/selected_schedule_tickets.types'
import ProductTicket from './product_ticket'
import defaultResizer, { useResizerOnEnter } from 'shared_components/resizer'

import './product_list.scss'
const cn = clssnms('product-list')

const mediaQueryModesMapping = {
  mobile: TicketMediaQueryTypes.Mobile,
  mobileLandscape: TicketMediaQueryTypes.Mobile,
  tablet: TicketMediaQueryTypes.Desktop,
  desktop: TicketMediaQueryTypes.Desktop,
}
const initialMediaQueryType = mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop']

export interface ProductListProps {
  tickets: ReadonlyArray<TicketTuple>
  visibleProductsAmount: number
  selectedScheduleTickets: ScheduleTicketsIterator<TicketTuple>
  scheduleTickets: ScheduleTicketsIterator<ReadonlyArray<TicketTuple>>
}

const ProductList: React.FC<ProductListProps> = memo((props) => {
  const [mediaQueryType, setMediaQueryType] = useState(initialMediaQueryType)
  const handleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    setMediaQueryType(mediaQueryModesMapping[meadiaQueryKey])
  }
  useResizerOnEnter(handleMediaQueryTypeChange)

  return (
    <div className={cn(null, { '--mobile': mediaQueryType === TicketMediaQueryTypes.Mobile })}>
      <div className={cn('item')}>
        <AdComponent index={0} mediaQueryType={mediaQueryType} />
      </div>
      <TicketList {...props} firstIndex={0} lastIndex={2} mediaQueryType={mediaQueryType} />
      <div className={cn('item')}>
        <AdComponent index={3} mediaQueryType={mediaQueryType} />
      </div>
      <TicketList
        {...props}
        firstIndex={2}
        lastIndex={props.visibleProductsAmount}
        mediaQueryType={mediaQueryType}
      />
    </div>
  )
})

const TicketList: React.FC<ProductListProps & {
  firstIndex: number
  lastIndex: number
  mediaQueryType?: TicketMediaQueryTypes
}> = memo((props) => {
  const productsCount = props.lastIndex - props.firstIndex
  if (productsCount <= 0) {
    return null
  }
  const renderArray = [...new Array(productsCount)]
  return (
    <TransitionGroup component={null}>
      {renderArray.map((_, index) => {
        const ticketIndex = index + props.firstIndex
        let ticket = props.tickets[ticketIndex]
        if (!ticket) {
          return null
        }
        return (
          <CSSTransition
            key={ticket[0].sign}
            timeout={{ enter: 300 }}
            appear={true}
            exit={false}
            classNames="fade"
          >
            <div className={cn('item')}>
              <ProductTicket
                ticketIndex={ticketIndex}
                originalTicket={ticket}
                scheduleTicketsMap={props.scheduleTickets}
                selectedScheduleTickets={props.selectedScheduleTickets}
                mediaQueryType={props.mediaQueryType}
              />
            </div>
          </CSSTransition>
        )
      })}
    </TransitionGroup>
  )
})

const AdComponent: React.FC<{ index: number; mediaQueryType: TicketMediaQueryTypes }> = ({
  index,
  mediaQueryType,
}) => {
  return (
    <ErrorBoundary errorType={ErrorType.Error} errorText="Error at ad placement">
      <div className={cn('ad')}>
        <AdContainer
          key={`ad_${index}`}
          name={`product_${index}`}
          mediaQueryType={mediaQueryType}
        />
      </div>
    </ErrorBoundary>
  )
}

export default ProductList
