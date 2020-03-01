import React from 'react'
import InformerCollapse from 'components/informer_collapse/informer_collapse'
import { InformerIcon } from 'components/informer/informer.types'
import { connect } from 'react-redux'
import clssnms from 'clssnms'
import { withTranslation, WithTranslation, Trans } from 'react-i18next'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
const { is_open_jaw } = require('utils')
import Price from 'react_components/price/price.coffee'
import {
  getCheaperAirportFromSearchParamsAndCheapestTicket,
  hasDirectFlight,
  getTicketPriceMaximumIncrease,
  getTicketPrice,
} from './product_list_informer.utils'
import { Airport, CheaperAirport, InformerType, Segment } from './product_list_informer.types'
import ProductTicket from 'components/product_list/product_ticket'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { TicketMediaQueryTypes } from 'shared_components/ticket/ticket.types'
import defaultResizer from 'shared_components/resizer'
import { ProductListProps } from 'components/product_list/product_list'
import { getTopTicketBySortKey } from 'common/js/redux/selectors/tickets.selectors'

import './product_list_informer.scss'

const cn = clssnms('product-list-informer')

const mediaQueryModesMapping = {
  mobile: TicketMediaQueryTypes.Mobile,
  mobileLandscape: TicketMediaQueryTypes.Mobile,
  tablet: TicketMediaQueryTypes.Desktop,
  desktop: TicketMediaQueryTypes.Desktop,
}

interface OwnProps {
  cheapestFilteredTicket: TicketTuple
  scheduleTickets: ProductListProps['scheduleTickets']
  selectedScheduleTickets: ProductListProps['selectedScheduleTickets']
}

interface StateProps {
  searchParams: {
    segments: Segment[]
  }
  cheapestTicket: TicketTuple
  airports: {
    [key: string]: Airport
  }
  precheckedFilters: string[]
  sort: string
  tickets: TicketTuple[]
  isFiltersChangedByUser: boolean
}

interface DispatchProps {
  reachGoal: (event: string, data?: any) => void
}

export type ProductListInformerProps = OwnProps & StateProps & DispatchProps

interface ProductListInformerState {
  shouldShow: boolean
  informerType?: InformerType
  isAirportsPrechecked?: boolean
  cheaperAirport?: CheaperAirport
  pricesDifference: number
  bestTicket?: TicketTuple
  mediaQueryType: TicketMediaQueryTypes
}

export class ProductListInformer extends React.PureComponent<
  ProductListInformerProps & WithTranslation,
  ProductListInformerState
> {
  isShown: boolean = false
  mediaQueryModes: string = 'mobile, mobileLandscape, tablet, desktop'
  state: ProductListInformerState = {
    shouldShow: false,
    pricesDifference: 0,
    mediaQueryType: mediaQueryModesMapping[defaultResizer.currentMode() || 'desktop'],
  }

  static getDerivedStateFromProps(
    props: ProductListInformerProps & WithTranslation,
    state: ProductListInformerState,
  ): Partial<ProductListInformerState> | null {
    if (is_open_jaw(props.searchParams.segments) || props.isFiltersChangedByUser) {
      return {
        shouldShow: false,
      }
    }

    // NOTE: define is type cheaperAirport
    const isAirportsPrechecked = Array.from(props.precheckedFilters).includes('airports')
    if (isAirportsPrechecked) {
      const cheaperAirport = getCheaperAirportFromSearchParamsAndCheapestTicket(
        props.searchParams,
        props.cheapestTicket,
      )
      const pricesDifference =
        getTicketPrice(props.cheapestFilteredTicket) - getTicketPrice(props.cheapestTicket)
      if (cheaperAirport && pricesDifference > 0) {
        return {
          informerType: InformerType.CheaperAirport,
          shouldShow: true,
          cheaperAirport,
          pricesDifference,
          bestTicket: props.cheapestTicket,
        }
      } else if (state.cheaperAirport && state.bestTicket) {
        return {
          informerType: undefined,
          shouldShow: false,
          cheaperAirport: undefined,
          pricesDifference: undefined,
          bestTicket: undefined,
        }
      }
    }

    // NOTE: define is type straightFlight
    if (props.sort !== 'duration' && hasDirectFlight(props.tickets)) {
      const cheapestTicketPrice = getTicketPrice(props.cheapestFilteredTicket)
      const cheapestDirectFlightTicket = getTopTicketBySortKey(props.tickets, 'duration')
      const cheapestDirectFlightTicketPrice = getTicketPrice(cheapestDirectFlightTicket)
      const ticketPriceMaxIncrease = getTicketPriceMaximumIncrease(cheapestDirectFlightTicketPrice)

      if (cheapestDirectFlightTicketPrice > cheapestTicketPrice) {
        if (cheapestDirectFlightTicketPrice <= cheapestTicketPrice * ticketPriceMaxIncrease) {
          const pricesDifference = cheapestDirectFlightTicketPrice - cheapestTicketPrice
          return {
            informerType: InformerType.DirectFlight,
            shouldShow: true,
            pricesDifference,
            bestTicket: cheapestDirectFlightTicket,
          }
        } else if (state.bestTicket) {
          return {
            informerType: undefined,
            shouldShow: false,
            pricesDifference: undefined,
            bestTicket: undefined,
          }
        }
      }
    }

    return null
  }

  componentDidMount() {
    if (this.state.shouldShow) {
      this.reachGoal('showed')
      this.isShown = true
      defaultResizer.onMode(this.mediaQueryModes, this.hanleMediaQueryTypeChange)
    }
  }

  componentWillUnmount() {
    if (this.isShown) {
      defaultResizer.offMode(this.mediaQueryModes, this.hanleMediaQueryTypeChange)
    }
  }

  componentDidUpdate(
    prevProps: ProductListInformerProps & WithTranslation,
    prevState: ProductListInformerState,
  ) {
    if (!this.isShown && this.state.shouldShow && prevState.shouldShow !== this.state.shouldShow) {
      this.reachGoal('showed')
      this.isShown = true
      defaultResizer.onMode(this.mediaQueryModes, this.hanleMediaQueryTypeChange)
    }
  }

  getInformerTitle(): React.ReactNode | undefined {
    const { informerType, cheaperAirport, pricesDifference } = this.state

    if (!informerType) {
      return
    }

    // NOTE: get data for informer with type cheaperAirport
    if (informerType === InformerType.CheaperAirport && cheaperAirport) {
      return (
        <Trans
          i18nKey={cheaperAirport.departure ? 'straightInformer' : 'returnInformer'}
          ns="product_list_informer"
          values={{
            place: cheaperAirport.departure
              ? this.props.airports[cheaperAirport.departure].name
              : this.props.airports[cheaperAirport.arrival].name,
          }}
          components={[<Price key="cheaperPrice" valueInRubles={pricesDifference} />]}
        />
      )
    }

    // NOTE: get data for informer with type straightFlight
    if (informerType === InformerType.DirectFlight && pricesDifference) {
      const cheapestTicketPrice = getTicketPrice(this.props.cheapestFilteredTicket)

      return (
        <Trans
          i18nKey={
            pricesDifference <= cheapestTicketPrice * 0.4 ? 'directCheapInformer' : 'directInformer'
          }
          ns="product_list_informer"
          components={[<Price key="cheaperPrice" valueInRubles={pricesDifference} />]}
        />
      )
    }
  }

  getReachGoalExtendedData = () => {
    const { informerType, pricesDifference, cheaperAirport } = this.state
    const data = {
      informerType: informerType,
      informerPriceDifference: pricesDifference,
    }

    if (informerType === InformerType.CheaperAirport) {
      return {
        ...data,
        informerCheaperAirport:
          cheaperAirport && (cheaperAirport.arrival || cheaperAirport.departure),
        informerCurrentAirport:
          cheaperAirport && (cheaperAirport.arrivalCurrent || cheaperAirport.departureCurrent),
      }
    }

    return data
  }

  reachGoal = (event: string, data?: any) => {
    let extendedData = {
      ...data,
      ...this.getReachGoalExtendedData(),
    }
    this.props.reachGoal(`top_serp_informer--${event}`, extendedData)
  }

  handleBtnClick = (isOpen: boolean) => {
    const event = isOpen ? 'close' : 'open'
    this.reachGoal(event)
  }

  hanleMediaQueryTypeChange = (meadiaQueryKey: string) => {
    this.setState({ mediaQueryType: mediaQueryModesMapping[meadiaQueryKey] })
  }

  render() {
    const informerTitle = this.getInformerTitle()
    if (!this.state.shouldShow || !informerTitle) {
      return null
    }

    const { bestTicket, mediaQueryType } = this.state

    return (
      <InformerCollapse
        className={cn(null, { '--mobile': mediaQueryType === TicketMediaQueryTypes.Mobile })}
        title={informerTitle}
        onActionCallback={this.handleBtnClick}
        icon={InformerIcon.Recommendation}
        classMod="mb20"
      >
        <div className={cn('ticket')}>
          <ProductTicket
            ticketIndex={-1}
            originalTicket={bestTicket!}
            reachGoalData={this.getReachGoalExtendedData()}
            mediaQueryType={this.state.mediaQueryType}
            scheduleTicketsMap={this.props.scheduleTickets}
            selectedScheduleTickets={this.props.selectedScheduleTickets}
          />
        </div>
      </InformerCollapse>
    )
  }
}

const mapStateToProps = (state) => ({
  searchParams: state.searchParams,
  cheapestTicket: state.cheapestTicket,
  airports: state.airports,
  precheckedFilters: state.filters.precheckedFilters,
  isFiltersChangedByUser: state.filters.isFiltersChangedByUser,
  sort: state.sort,
  tickets: state.tickets,
})

const mapDispatchToProps = (dispatch) => ({
  reachGoal: (event, data) => dispatch(reachGoal(event, data)),
})

export const ProductListInformerWithTranslation = withTranslation('product_list_informer')(
  ProductListInformer,
)

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ProductListInformerWithTranslation)
