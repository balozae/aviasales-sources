import React from 'react'
import PropTypes from 'prop-types'
import Cookie from 'oatmeal-cookie'
import guestia from 'guestia/client'
import {div} from 'react-dom-factories'
import {connect} from 'react-redux'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'
import { addBodyClass, removeBodyClass } from 'common/js/redux/actions/body_class.actions'
import { showDirectionSubscriptionPopup } from 'common/js/redux/actions/direction_subscriptions.actions'
import Prediction from 'prediction/prediction'
import PrerollComponent from 'preroll/preroll'
import DirectionSubscriptionsComponent from 'direction_subscriptions/direction_subscriptions'
import Filters from 'filters/filters'
import DirectFlights from 'direct_flights/direct_flights'
import ProductExtraContentComponent from 'product_extra_content/product_extra_content'
import ProductContainerComponent from 'product_container/product_container'
import SYSControllerComponent from '../../common/js/sys_controller'
import IDDQDObserverComponent from 'yasen_client_debugger/iddqd_observer'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import ADContainerComponent from 'ad_container/ad_container'
import GoToTopButtonComponent from 'go_to_top_button/go_to_top_button'
import BlackOverlayComponent from 'black_overlay/black_overlay'
import TitlePriceDifferenceComponent from 'title_price_difference/title_price_difference'
import LoaderComponent from 'prediction/loader'
import DynamicFavComponent from 'dynamic_fav/dynamic_fav'
import {is_open_jaw} from 'utils'
import checkHeadlessBrowser from 'common/js/phantom_detector'
import CommonErrorInformerComponent from 'error_informer/common/common'
import EmptyTicketsContainerComponent from 'error_informer/empty_tickets.container'
import InitedSearchInformerComponent from 'error_informer/inited_search/inited_search'
import { getTurnOffPrerollTimeout } from 'common/js/redux/selectors/debug_settings.selectors'
import {hasSameWoodySubscriptions} from 'common/js/redux/selectors/woody_subscriptions.selectors'
import './app.scss'

Preroll = React.createFactory(PrerollComponent)
DirectionSubscriptions = React.createFactory(DirectionSubscriptionsComponent)
BlackOverlay = React.createFactory(BlackOverlayComponent)
CommonErrorInformer = React.createFactory(CommonErrorInformerComponent)
EmptyTicketsContainer = React.createFactory(EmptyTicketsContainerComponent)
InitedSearchInformer = React.createFactory(InitedSearchInformerComponent)
ProductContainer = React.createFactory(ProductContainerComponent)
ProductExtraContent = React.createFactory(ProductExtraContentComponent)
ADContainer = React.createFactory(ADContainerComponent)
SYSController = React.createFactory(SYSControllerComponent)
IDDQDObserver = React.createFactory(IDDQDObserverComponent)
GoToTopButton = React.createFactory(GoToTopButtonComponent)
TitlePriceDifference = React.createFactory(TitlePriceDifferenceComponent)
Loader = React.createFactory(LoaderComponent)
DynamicFav = React.createFactory(DynamicFavComponent)

checkHeadlessBrowser()

PREROLL_TIMEOUT_TIME = 7000
INACTIVE_POPUP_TIMEOUT_TIME = 1000 * 60 * 5 # 5 min
INACTIVE_POPUP_EVENTS_TO_LISTEN = ['mousemove', 'keydown', 'touchstart']

class App extends React.Component
  @displayName: 'App'

  constructor: (props) ->
    super(props)
    @state =
      isPrerollTimeout: true

  @propTypes: {
    searchSegments: PropTypes.array
    tickets: PropTypes.array
    error: PropTypes.string
    searchStatus: PropTypes.string
    searchParams: PropTypes.object
    gates: PropTypes.object
    airlines: PropTypes.object
    airports: PropTypes.object
    searchRequestId: PropTypes.string
  }

  renderError: ->
    if @props.error
      CommonErrorInformer({
        error: @props.error
      })
    else if @props.tickets.length is 0 and @props.searchStatus is 'FINISHED'
      EmptyTicketsContainer()
    else if @props.searchStatus is 'INITED'
      InitedSearchInformer({
        reachGoal: @props.reachGoal
      })

  renderPreroll: ->
    if @props.searchStatus is 'STARTED' or (not @isEnoughData() and not @hasErrors()) or
      (@state.isPrerollTimeout and @props.searchStatus isnt 'FINISHED')
        unless @prerollTimeout
          @prerollTimeout = setTimeout( =>
            @setState(isPrerollTimeout: false)
          , if @props.turnOffPrerollTimeout then 0 else PREROLL_TIMEOUT_TIME)
        div
          className: @elementClassName('preroll')
          div
            className: @elementClassName('preroll-hint')
            Preroll()
          div
            className: @elementClassName('preroll-extra')
            ADContainer
              name: 'preroll'

  isEnoughData: ->
    Object.keys(@props.gates).length isnt 0 and
    Object.keys(@props.airlines).length isnt 0 and
    Object.keys(@props.airports).length isnt 0 and
    Object.keys(@props.searchParams.segments).length isnt 0

  hasErrors: ->
    @props.error or (@props.tickets.length is 0 and @props.searchStatus is 'FINISHED')

  renderResults: ->
    isOpenJaw = is_open_jaw(@props.searchParams.segments)

    [
      div
        key: 'informer'
        className: @elementClassName('informer')
        DirectionSubscriptions() unless isOpenJaw
        Filters
        DirectFlights
      div
        key: 'content'
        className: @elementClassName('content')
        ProductContainer()
      ProductExtraContent
        key: 'extra-col'
      BlackOverlay
        key: 'black-overlay'
    ]

  renderPrediction: ->
    if @props.searchParams?.segments and not @hasErrors()
      Prediction

  handleBodyClasses: ->
    # TODO: use className
    @props.removeBodyClasses(['--oneway', '--roundtrip', '--mutliway'])
    newClass = '--roundtrip'
    if is_open_jaw(@props.searchParams.segments)
      newClass = '--multiway'
    else if @props.searchParams.segments and @props.searchParams.segments.length is 1
      newClass = '--oneway'
    @props.addBodyClass(newClass)

  handleMouseOut: (e) =>
    e = e ? e : window.event
    from = e.relatedTarget || e.toElement
    if (not from or from.nodeName is 'HTML') and
        e.clientY < 20 and
        @props.searchStatus in ['FINISHED', 'EXPIRED'] and
        not @exitPopupHasShown and
        not Cookie.get('suspend_exit_popup') and
        not @props.isHasSameSubs
      @props.showDirectionSubscriptionPopup({
        type: 'exit'
      })
      @exitPopupHasShown = true

  showInactivePopup: =>
    if @props.searchStatus in ['FINISHED', 'EXPIRED'] and
      not @props.isHasSameSubs and
      not @inactivePopupHasShown
        @inactivePopupHasShown = true
        @removeInactiveTimeoutHandlers()
        @props.showDirectionSubscriptionPopup({
          type: 'inactive'
        })

  resetInactiveTimer: =>
    clearTimeout(@inactiveTimeout)
    @inactiveTimeout = setTimeout((=>
      @showInactivePopup()
    ), INACTIVE_POPUP_TIMEOUT_TIME)

  addInactiveTimeoutHandlers: =>
    @resetInactiveTimer()
    INACTIVE_POPUP_EVENTS_TO_LISTEN.forEach((event) =>
      document.addEventListener(event, @resetInactiveTimer))

  removeInactiveTimeoutHandlers: =>
    clearTimeout(@inactiveTimeout)
    INACTIVE_POPUP_EVENTS_TO_LISTEN.forEach((event) =>
      document.removeEventListener(event, @resetInactiveTimer))

  componentWillReceiveProps: (nextProps) ->
    if nextProps.searchStatus is 'STARTED'
      @setState(isPrerollTimeout: true)
      clearTimeout(@prerollTimeout)
      @prerollTimeout = null
      @handleBodyClasses()

  componentWillMount: ->
    document.addEventListener('mouseout', @handleMouseOut)
    @addInactiveTimeoutHandlers()

  componentWillUnmount: ->
    clearTimeout(@prerollTimeout)
    document.removeEventListener('mouseout', @handleMouseOut)
    @removeInactiveTimeoutHandlers()

  render: ->
    if (window.location.pathname + window.location.search).match(/\/search(\/|\/\?|\?|^(\?.*)|)$/)
      return InitedSearchInformer({
        reachGoal: @props.reachGoal
      })

    return null if @props.searchStatus is 'INITED' or not @props.searchRequestId
    div(
      key: @props.searchRequestId
    ,
      @renderPrediction()
      Loader(startAnimation: @props.showCountdown, color: 'blue')
      div
        className: @blockClassName()
        div
          className: @elementClassName('inner')
          @renderPreroll() or @renderError() or @renderResults()
          if @props.searchStatus in ['SHOWN', 'FINISHED', 'EXPIRED']
            GoToTopButton(key: 'go-to-top-button')
      IDDQDObserver()
      SYSController()
      TitlePriceDifference()
      DynamicFav()
      div(id: 'search-results', null)
    )

mapStateToProps = (state) ->
  {
    tickets: state.tickets
    error: state.error
    searchStatus: state.searchStatus
    searchParams: state.searchParams
    gates: state.gates
    airlines: state.airlines
    airports: state.airports
    turnOffPrerollTimeout: getTurnOffPrerollTimeout(state)
    showCountdown: state.searchStatus not in ['FINISHED', 'EXPIRED', 'INITED']
    currency: state.currency
    searchRequestId: state.requestId,
    formParams: state.aviaParams,
    isHasSameSubs: hasSameWoodySubscriptions(state),
  }

mapDispatchToProps = (dispatch) ->
  {
    removeBodyClasses: (classNames) -> dispatch(removeBodyClass(...classNames))
    addBodyClass: (className) -> dispatch(addBodyClass(className))
    showDirectionSubscriptionPopup: (params) -> dispatch(showDirectionSubscriptionPopup(params)),
    reachGoal: (name, data) -> dispatch(reachGoal(name, data)),
  }

App = connect(mapStateToProps, mapDispatchToProps)(BlockElementClassnames(App))

export default App
