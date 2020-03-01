import React from 'react'
import {div, span} from 'react-dom-factories'
import PropTypes from 'prop-types'

export default ({segment}) ->
  return null unless segment
  origin = segment.origin_name or segment.origin_city_iata or segment.origin
  destination = segment.destination_name or segment.destination_city_iata or segment.destination
  div(
    className: 'filter__sub-title'
    span
      className: 'filter__route-origin'
      origin
    span
      className: 'filter__route-plane-wrap'
      span
        className: 'filter__route-destination'
        destination
  )
