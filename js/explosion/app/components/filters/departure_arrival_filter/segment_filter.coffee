import React from 'react'
import PropTypes from 'prop-types'
import {div} from 'react-dom-factories'
import EndpointSliderComponent from './endpoint_slider'
import SegmentHeader from './segment_header'
import { withTranslation } from 'react-i18next';

EndpointSlider = React.createFactory(EndpointSliderComponent)

class SegmentFilter extends React.Component
  @displayName: 'SegmentFilter'
  @propTypes:
    boundaries: PropTypes.object.isRequired
    changes: PropTypes.object
    airportsInfo: PropTypes.object.isRequired
    onChange: PropTypes.func.isRequired
    segment: PropTypes.object.isRequired

  render: ->
    {segment} = @props
    fromOrigin = segment.origin_cases?.ro or segment.origin_name or
      segment.origin_city_iata or segment.origin
    toDestination = segment.destination_cases?.vi or segment.destination_name or
      segment.destination_city_iata or segment.destination
    div null,
      SegmentHeader(segment: @props.segment)
      EndpointSlider(
        onChange: @handleChange.bind(this, 'departureRange')
        boundaries: @props.boundaries.departureRange
        changes: @props.changes?.departureRange or {}
        title: @props.t('filters:departureFrom', { cityName: fromOrigin }) + ':'
        prices: @props.boundaries.departurePrices
        convertStepFunc: @props.convertStepFunc
      )
      EndpointSlider(
        onChange: @handleChange.bind(this, 'arrivalRange')
        boundaries: @props.boundaries.arrivalRange
        changes: @props.changes?.arrivalRange or {}
        title: @props.t('filters:arrivalTo', { cityName: toDestination }) + ':'
        prices: @props.boundaries.arrivalPrices
        convertStepFunc: @props.convertStepFunc
      )

  handleChange: (endpointKey, values, handle) ->
    @props.onChange(endpointKey, values, handle)
  
  
export default withTranslation('filters')(SegmentFilter)
