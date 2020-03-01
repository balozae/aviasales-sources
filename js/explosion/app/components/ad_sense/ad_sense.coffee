import React from 'react'
import {div} from 'react-dom-factories'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classNames from 'classnames'
import './adsense-banner.scss'

FIRST_ADSENSE_PLACEMENT_INDEX = 'product_0'
THIRD_ADSENSE_PLACEMENT_INDEX = 'product_3'

CHECK_RENDERED_DELAY = 2000

getParsedQuery = (adSenseParams, firstSegment) ->
  if adSenseParams?.query
    parsedQuery = adSenseParams.query.replace(/%(origin|destination)(?:_([a-z]{2}))?%/g, (m, place, caseId) ->
      firstSegment["#{place}_cases"]?[caseId] or firstSegment["#{place}_name"]
    )
  else
    parsedQuery = "отели #{firstSegment.destination_cases.ro}"
  parsedQuery

class AdSense extends React.Component
  @displayName: 'AdSense'

  @propTypes:
    name: PropTypes.string.isRequired
    adSenseParams: PropTypes.object
    searchParams: PropTypes.object
    pageOptions: PropTypes.object
    onAdNotRendered: PropTypes.func
    isSearchFinished: PropTypes.bool

  constructor: (props) ->
    super(props)
    @state =
      noAdsRendered: false

  componentDidMount: ->
    return if window._googCsa
    ((G, o, O, g, L, e) ->
      G[g] = G[g] or ->
        (G[g]['q'] = G[g]['q'] or []).push arguments
        return

      G[g]['t'] = 1 * new Date
      L = o.createElement(O)
      e = o.getElementsByTagName(O)[0]
      L.async = 1
      L.src = '//www.google.com/adsense/search/async-ads.js'
      e.parentNode.insertBefore L, e
      return
    ) window, document, 'script', '_googCsa'

  # FIXME: dont pass name, we need pass all data from store (include adSenseRequestParams etc)
  #        we can mix adSenseParams to advertisement directly in store
  # NOTE: documentation https://developers.google.com/custom-search-ads/docs/reference
  componentDidUpdate: ->
    return unless @props.isSearchFinished
    adSenseRequestParams =
      'product_0':
        adPlace: @props.adSenseParams.ad_top
        adPageOptions: Object.assign({}, @props.pageOptions, @props.adSenseParams.ad_top_page_options or {})
      'product_3':
        adPlace: @props.adSenseParams.ad_third
        adPageOptions: @props.pageOptions
    window._googCsa 'ads', adSenseRequestParams[@props.name].adPageOptions,
      adSenseRequestParams[@props.name].adPlace
    setTimeout(=>
      @handleAdRenderCheck(adSenseRequestParams[@props.name].adPlace.container)
    , CHECK_RENDERED_DELAY)

  handleAdRenderCheck: (container) =>
    if document.querySelector("##{container} iframe")?.children.length is 0
      @setState({noAdsRendered: true})
      @props.onAdNotRendered() if @props.onAdNotRendered

  render: ->
    return null unless @props.isSearchFinished
    return null if @state.noAdsRendered
    # FIXME: get id from store
    switch @props.name
      when FIRST_ADSENSE_PLACEMENT_INDEX
        div
          className: 'adsense-banner'
          div
            className: 'adsense-banner__inner'
            id: 'google_tag_id_doubleclick_small'
      when THIRD_ADSENSE_PLACEMENT_INDEX
        div
          className: 'adsense-banner'
          div
            id: 'ru-aviasales-third'
      else
        console.warn("Unknown adsense position #{@props.name}")
        null

mapStateToProps = (state) ->
  adSenseParams: state.adSenseParams
  searchParams: state.searchParams
  pageOptions: Object.assign(
    {},
    state.adSenseParams.page_options or {},
    query: getParsedQuery(state.adSenseParams, state.searchParams.segments[0])
  )
  isSearchFinished: state.isSearchFinished

export default connect(mapStateToProps)(AdSense)
