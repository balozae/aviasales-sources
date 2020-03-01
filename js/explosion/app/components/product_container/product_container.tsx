import React from 'react'
import { AppState } from 'common/js/redux/types/root/explosion'
import clssnms from 'clssnms'
import { connect } from 'react-redux'
import flagr from 'common/utils/flagr_client_instance'
import { prepareAllTypesTickets } from 'common/js/redux/selectors/product_container.selectors'
import { TicketTuple } from 'shared_components/ticket/ticket_incoming_data.types'
import { ScheduleTicketsIterator } from 'common/js/redux/types/selected_schedule_tickets.types'
import { getAdvertisement } from 'common/js/redux/selectors/advertisement.selectors'
import { getHighlightedTicketParams } from 'common/js/redux/selectors/highlighted_ticket_params.selectors'
import { getSearchFinished } from 'common/js/redux/selectors/search.selectors'
import { getCurrency, getCurrencies } from 'common/js/redux/selectors/currencies.selectors'
import { getAirlines } from 'common/js/redux/selectors/airlines.selectors'
import { getAirports } from 'common/js/redux/selectors/airports.selectors'
import { getGates } from 'common/js/redux/selectors/gates.selectors'
import TicketCurrencyContext, {
  defaultCurrenciesList,
} from 'shared_components/ticket/ticket_context/ticket_currency_context/ticket_currency_context'
import AirlinesContext, {
  buildAirlinesContext,
} from 'shared_components/ticket/ticket_context/airlines_context/airlines_context'
import GatesContext, {
  buildGatesContext,
} from 'shared_components/ticket/ticket_context/gates_context/gates_context'
import PlacesContext, {
  buildPlacesContext,
} from 'shared_components/ticket/ticket_context/places_context/places_context'
import SavedFilters from 'components/saved_filters/saved_filters'
import ProductListInformer from './product_list_informer/product_list_informer'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import { ErrorType } from 'shared_components/error_boundary/error_boundary.types'
import './product_container.scss'
import HighlightedTicket from 'components/highlighted_ticket/highlighted_ticket'
import ProductList from 'components/product_list/product_list'
import ProductFilterHint from 'components/product_filter_hint/product_filter_hint'
import AdMediaAlpha from 'components/ad_media_alpha/ad_media_alpha'
import FilterMessage from 'filter_message/filter_message.coffee'
import ShowMoreProducts from 'show_more_products/show_more_products.coffee'
import AdClicktripz from 'ad_clicktripz/ad_clicktripz.coffee'
import Sorting from 'sorting/sorting.coffee'

const PRODUCTS_PER_PAGE = 10
const cn = clssnms('product-container')
const IS_SHOW_AD_MEDIA_ALPHA = Math.random() < 0.5

export interface ProductContainerTicketsProps {
  filteredTickets: ReadonlyArray<TicketTuple>
  highlightedTicket?: TicketTuple
  scheduleTickets: ScheduleTicketsIterator<ReadonlyArray<TicketTuple>>
  selectedScheduleTickets: ScheduleTicketsIterator<TicketTuple>
}

interface ProductContainerProps extends ProductContainerTicketsProps {
  advertisement: ReturnType<typeof getAdvertisement>
  highlightedTicketParams: ReturnType<typeof getHighlightedTicketParams>
  isSearchFinished: ReturnType<typeof getSearchFinished>
  currency: ReturnType<typeof getCurrency>
  currencies: ReturnType<typeof getCurrencies>
  airlines: ReturnType<typeof getAirlines>
  airports: ReturnType<typeof getAirports>
  gates: ReturnType<typeof getGates>
}

interface ProductContainerState {
  visibleProductsAmount: number
}

class ProductContainer extends React.Component<ProductContainerProps, ProductContainerState> {
  state: ProductContainerState = { visibleProductsAmount: PRODUCTS_PER_PAGE }

  handleShowMoreProductsClick = () =>
    this.setState((state) => ({
      visibleProductsAmount: state.visibleProductsAmount + PRODUCTS_PER_PAGE,
    }))

  getProductsAmount() {
    // NOTE: dont add ad to product, if we have less tickets then ads position
    return Object.keys(this.props.advertisement).reduce(
      (productsAmount, adPosition) =>
        parseInt(adPosition, 10) <= productsAmount ? productsAmount + 1 : productsAmount,
      this.props.filteredTickets.length,
    )
  }

  getTicketsForSorting() {
    return this.props.highlightedTicket
      ? [this.props.highlightedTicket, ...this.props.filteredTickets]
      : this.props.filteredTickets
  }

  renderResults() {
    const withVisibleTickets = this.props.filteredTickets.length !== 0
    const productsAmount = this.getProductsAmount()
    const visibleProductsAmount = Math.min(this.state.visibleProductsAmount, productsAmount)
    if (!(withVisibleTickets || this.props.highlightedTicketParams)) {
      return null
    }
    return (
      <>
        {/* NOTE: do not show informer with badges */}
        {!flagr.is('avs-exp-badges') && withVisibleTickets && this.props.isSearchFinished && (
          <ProductListInformer
            cheapestFilteredTicket={this.props.filteredTickets[0]}
            scheduleTickets={this.props.scheduleTickets}
            selectedScheduleTickets={this.props.selectedScheduleTickets}
          />
        )}
        {withVisibleTickets && (
          <div className={cn('header')}>
            <div className={cn('header-item')}>
              <ErrorBoundary errorType={ErrorType.Error}>
                <Sorting tickets={this.getTicketsForSorting()} />
              </ErrorBoundary>
            </div>
          </div>
        )}
        {this.props.highlightedTicketParams && (
          <HighlightedTicket
            ticket={this.props.highlightedTicket!}
            highlightedTicketParams={this.props.highlightedTicketParams}
            scheduleTickets={this.props.scheduleTickets}
            selectedScheduleTickets={this.props.selectedScheduleTickets}
            isSearchFinished={this.props.isSearchFinished}
          />
        )}
        {withVisibleTickets && (
          <>
            <ProductList
              tickets={this.props.filteredTickets}
              visibleProductsAmount={visibleProductsAmount}
              scheduleTickets={this.props.scheduleTickets}
              selectedScheduleTickets={this.props.selectedScheduleTickets}
            />
            {productsAmount > visibleProductsAmount && (
              <>
                <div>
                  <ProductFilterHint />
                </div>
                <ShowMoreProducts
                  productsAmount={productsAmount}
                  visibleProductsAmount={visibleProductsAmount}
                  productsPerPage={PRODUCTS_PER_PAGE}
                  onClick={this.handleShowMoreProductsClick}
                />
              </>
            )}
          </>
        )}
        {IS_SHOW_AD_MEDIA_ALPHA ? <AdMediaAlpha placement="bottom_inline" /> : <AdClicktripz />}
      </>
    )
  }

  render() {
    return (
      <TicketCurrencyContext.Provider
        value={{
          currencies: this.props.currencies,
          currency: this.props.currency,
          currenciesList: defaultCurrenciesList,
        }}
      >
        <AirlinesContext.Provider value={buildAirlinesContext(this.props.airlines)}>
          <GatesContext.Provider value={buildGatesContext(this.props.gates)}>
            <PlacesContext.Provider value={buildPlacesContext(this.props.airports)}>
              <div>
                <SavedFilters />
                {this.renderResults() || <FilterMessage />}
              </div>
            </PlacesContext.Provider>
          </GatesContext.Provider>
        </AirlinesContext.Provider>
      </TicketCurrencyContext.Provider>
    )
  }
}

const mapStateToProps = (state: AppState): ProductContainerProps => ({
  ...prepareAllTypesTickets(state),
  advertisement: getAdvertisement(state),
  highlightedTicketParams: getHighlightedTicketParams(state),
  isSearchFinished: getSearchFinished(state),
  currency: getCurrency(state),
  currencies: getCurrencies(state),
  airlines: getAirlines(state),
  airports: getAirports(state),
  gates: getGates(state),
})

export default connect<ProductContainerProps>(mapStateToProps)(ProductContainer)
