import React from 'react'
import {connect} from 'react-redux'
import getShortUrl from 'short_url'
import localStorageHelper from 'local_storage_helper'
import {searchParamsToTitle, getRouteArray, getTripType} from 'trip_helper'
import {formatPriceWithSign, priceInRubToCurrency} from 'utils_price'
import {DEFAULT_CURRENCY} from 'common/utils/currencies'
import finity from 'finity-js'

INITIAL_TITLE = document.title
STORAGE_KEY = 'tabPrices'
STORAGE_CURRENCY_KEY = 'tabPricesCurrency'
EXPIRE_CACHE_MS = 15 * 60 * 1000 # 15 minutes

class TitlePriceDifference extends React.Component
  @displayName: 'TitlePriceDifference'

  componentDidMount: ->
    @invalidateTitleData()
    @setCurrency(@props.currency)
    window.addEventListener('storage', @handleStorageChanged.bind(this))
    window.addEventListener('beforeunload', @handleUnload.bind(this))
    document.addEventListener('visibilitychange', @handleVisibilityChange.bind(this))

  componentWillReceiveProps: (nextProps) ->
    if @props.currency isnt nextProps.currency
      @setCurrency(nextProps.currency)
    if @props.searchParamsWithId isnt nextProps.searchParamsWithId or nextProps.isSearchExpired or nextProps.error
      @removeTitleData()

  componentDidUpdate: (prevProps) ->
    if @props.isSearchFinished and @props.cheapestTicketPrice
      @updateTitleData(@props.cheapestTicketPrice)
    @changeTitle()

  componentWillUnmount: ->
    window.removeEventListener('storage', @handleStorageChanged.bind(this))
    document.removeEventListener('visibilitychange', @handleVisibilityChange.bind(this))
    document.title = INITIAL_TITLE
    @removeTitleData()

  handleStorageChanged: ({key, newValue}) ->
    if key is STORAGE_KEY or key is STORAGE_CURRENCY_KEY
      # NOTE: in IE11 there is some delay between event 'storage' and complete update in storage in another tab
      setTimeout( =>
        @changeTitle()
      , 100)

  handleUnload: ->
    @componentWillUnmount()

  handleVisibilityChange: ->
    unless document.hidden
      @setCurrency(@props.currency)
      @changeTitle()

  setCurrency: (currency) ->
    localStorageHelper.setItem(STORAGE_CURRENCY_KEY, currency)

  getCurrency: ->
    localStorageHelper.getItem(STORAGE_CURRENCY_KEY) or DEFAULT_CURRENCY

  changeTitle: ->
    currency = @getCurrency()
    isSameRouteInData = @isSameRouteInData()
    cheapestTabsPrice = @getCheapestTabsPrice()
    title = searchParamsToTitle(@props.searchParams, isSameRouteInData)
    if (@props.cheapestTicketPrice and cheapestTabsPrice and title and
      @props.isSearchFinished and not (@props.isSearchExpired or @props.error))
        if @props.cheapestTicketPrice <= cheapestTabsPrice
          document.title = "#{formatPriceWithSign(@props.cheapestTicketPrice, currency, @props.currencies)} | #{title}"
        else
          deltaPrice = parseInt(@props.cheapestTicketPrice - cheapestTabsPrice)
          deltaPriceInCurrency = priceInRubToCurrency(deltaPrice, currency, @props.currencies)
          if deltaPriceInCurrency
            document.title = "+#{formatPriceWithSign(deltaPrice, currency, @props.currencies)} | #{title}"
          else
            document.title = "#{formatPriceWithSign(@props.cheapestTicketPrice, currency, @props.currencies)} | #{title}"
    else
      document.title = title

  getCheapestTabsPrice: ->
    tabPrices = localStorageHelper.getJSONItem(STORAGE_KEY) or {}
    Math.min((price for searchId, {price} of tabPrices when price?)...)

  render: ->
    null

  isSameRouteInData: ->
    tabPrices = localStorageHelper.getJSONItem(STORAGE_KEY)
    return true unless tabPrices
    tabPricesKeys = Object.keys(tabPrices)
    tabPricesKeys.every((searchId) ->
      firstRoute = tabPricesKeys[0].split('_')[0]
      route = searchId.split('_')[0]
      firstRoute is route
    )

  invalidateTitleData: ->
    tabPrices = localStorageHelper.getJSONItem(STORAGE_KEY) or {}
    initialTabPricesLength = Object.keys(tabPrices).length
    for searchId, tabData of tabPrices
      if Date.now() - tabData.createdAt > EXPIRE_CACHE_MS
        delete tabPrices[searchId]
    if initialTabPricesLength isnt Object.keys(tabPrices).length
      localStorageHelper.setJSONItem(STORAGE_KEY, tabPrices)

  updateTitleData: (cheapestTicketPrice) ->
    localStorageHelper.setJSONItem(STORAGE_KEY, Object.assign(
      localStorageHelper.getJSONItem(STORAGE_KEY) or {},
      "#{@props.searchParamsWithId}":
        price: cheapestTicketPrice
        createdAt: Date.now()
    ))

  removeTitleData: ->
    tabPrices = localStorageHelper.getJSONItem(STORAGE_KEY) or {}
    delete tabPrices[@props.searchParamsWithId]
    if Object.keys(tabPrices).length is 0
      localStorageHelper.removeItem(STORAGE_KEY)
    else
      localStorageHelper.setJSONItem(STORAGE_KEY, tabPrices)

mapStateToProps = (state) ->
  route = getRouteArray(state.searchParams).join('') + getTripType(state.searchParams)
  {
    isSearchFinished: state.isSearchFinished
    isSearchExpired: state.searchStatus is 'EXPIRED'
    error: state.error
    searchParams: state.searchParams
    searchParamsWithId: route + '_' + getShortUrl(state.searchParams) + '_' + state.searchId
    cheapestTicketPrice: parseInt(state.cheapestTicket?[1][0].unified_price)
    currency: state.currency
    currencies: state.currencies
  }

export default connect(mapStateToProps)(TitlePriceDifference)
