import React from 'react'
import {div} from 'react-dom-factories'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classNames from 'classnames'
import {targetParams} from '../../common/js/target_params'
import {reachGoal} from 'common/js/redux/actions/metrics.actions'
import {getEmailFromUserInfoData} from 'user_account/selectors/user.selectors'
import {checkEmailAndPassToCallback} from './ad_double_click.utils'

window.googletag ?= {cmd: []}
slotsManager = {}

class AdDoubleClick extends React.Component
  @displayName: 'AdDoubleClick'

  @propTypes:
    placement: PropTypes.string.isRequired
    id: PropTypes.string.isRequired
    size: PropTypes.array.isRequired
    metricsName: PropTypes.string.isRequired
    searchParams: PropTypes.object
    onAdNotRendered: PropTypes.func
    zoneid: PropTypes.number
    userEmail: PropTypes.string

  setupTagWithEmailCheck: (isEmailExist) =>
    @setupTag(@props.placement, @props.id, @props.size, @props.searchParams, @props.cityDistance, isEmailExist)

  componentDidMount: ->
    @criteoUnits = []
    if @props.zoneid
      @criteoUnits.push(
        'slotid': @props.id
        'zoneid': @props.zoneid
      )
    checkEmailAndPassToCallback(@setupTagWithEmailCheck, @props.userEmail)


  componentWillUnmount: ->
    # NOTE: googletag dont have removeEventListener lol
    @dontFireEventListener = true

  handleSlotRenderEnded: (event) =>
    return if @dontFireEventListener
    bannerPosition = event.slot.getAdUnitPath()
    if bannerPosition is @props.placement
      if event.isEmpty
        @props.onAdNotRendered() if @props.onAdNotRendered
      else
        @props.dispatch(reachGoal('DOUBLECLICK_SHOWN', {position: @props.metricsName}))

  setupTag: (placement, elementId, bannerSize, searchParams, cityDistance, isUserEmailExist) =>
    googletag.cmd.push =>
      if Object.keys(searchParams).length > 0
        googletag.pubads().setTargeting(key, value + '') for key, value of targetParams(Object.assign(searchParams, {isUserEmailExist}), cityDistance)
      if slotsManager[placement]
        #NOTE: if there is criteo placement send request for bids using existing slot otherwise reload doubleclik banner
        if window.Criteo and Object.keys(window.Criteo).length > 0 and @criteoUnits.length > 0
          window.Criteo.events.push(=>
            window.Criteo.SetLineItemRanges('0..3:0.02;3..8:0.05;8..20:0.50;20..30:1.00')
            window.Criteo.RequestBids({placements: @criteoUnits},
              @launchAdServer.bind(this, elementId, slotsManager[placement]), 1500)
          )
        else
          googletag.pubads().updateCorrelator()
          googletag.pubads().refresh([slotsManager[placement]])
      else
        renderedSlot = googletag.
          defineSlot(placement, bannerSize, elementId)?.
          addService(googletag.pubads()).
          setCollapseEmptyDiv(true, true)
        googletag.enableServices()
        slotsManager[placement] = renderedSlot
        googletag.pubads().setSafeFrameConfig(
          allowPushExpansion: true
          allowOverlayExpansion: true
        )
        googletag.display(elementId)
        #NOTE: if there is criteo placement send request for bids otherwise show doubleclik banner
        if window.Criteo and Object.keys(window.Criteo).length > 0 and @criteoUnits.length > 0
          window.Criteo.events.push(=>
            window.Criteo.SetLineItemRanges('0..3:0.02;3..8:0.05;8..20:0.50;20..30:1.00')
            window.Criteo.RequestBids({placements: @criteoUnits}, @launchAdServer.bind(this, elementId, renderedSlot), 1500)
          )
        else
          # We need it as we called `disableInitialLoad()` before.
          googletag.pubads().refresh([renderedSlot])

    googletag.cmd.push(=>
      googletag.pubads().addEventListener('slotRenderEnded', @handleSlotRenderEnded)
    )

  launchAdServer: (elementId, renderedSlot) ->
    googletag.cmd.push(->
      # NOTE: criteo placements sets in doubleclick_script.html
      ctoBid = window.Criteo.GetBidsForAdUnit(elementId)[0]
      if ctoBid
        renderedSlot.setTargeting('crt_pb', ctoBid.cpm_bucket)
        renderedSlot.setTargeting('crt_bidid', ctoBid.id)
      googletag.pubads().refresh([renderedSlot])
    )

  render: ->
    div
      id: @props.id
      className: classNames(
        "banner-#{@props.size.join('x')}"
        'double-click'
      )

mapStateToProps = (state) ->
  searchParams: state.searchParams
  cityDistance: state.cityDistance
  userEmail: getEmailFromUserInfoData(state)


export default connect(mapStateToProps)(AdDoubleClick)
