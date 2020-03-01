import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {div} from 'react-dom-factories'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import './styles/loader.scss'

COLOR_CLASS_MAP =
  blue: '--blue'
  white: '--white'

SPEED_CLASS_MAP =
  fast: '--fast'

class Loader extends React.Component
  @displayName: 'Loader'

  @propTypes:
    startAnimation: PropTypes.bool
    sticky: PropTypes.bool
    color: PropTypes.string
    speed: PropTypes.string
    background: PropTypes.string

  @defaultProps:
    startAnimation: false
    sticky: true

  constructor: (props) ->
    super(props)
    @state = isSticky: false

  componentWillUnmount: ->
    window.removeEventListener('scroll', @handleScroll) if @props.sticky

  componentDidMount: ->
    window.addEventListener('scroll', @handleScroll) if @props.sticky

  handleScroll: =>
    # TODO: rewrite when design is come
    # window.requestAnimationFrame(=>
    #   top = window.scrollY or window.pageYOffset or document.documentElement.scrollTop
    #   @setState(isSticky: top > @props.offsetHeight)
    # )

  render: ->
    started = not @state.resetLoader and @props.startAnimation
    finished = not @props.startAnimation
    div
      className: classNames(
        @blockClassName()
        '--sticky': @state.isSticky
      )
      div
        className: classNames(
          @elementClassName('stripes')
          '--animation-started': started
          '--animation-finished': finished
          COLOR_CLASS_MAP[@props.color] or ''
          SPEED_CLASS_MAP[@props.speed] or ''
        )
      div
        className: classNames(
          @elementClassName('bar')
          '--animation-started': started
          '--animation-finished': finished
          COLOR_CLASS_MAP[@props.background] or ''
        )

export default BlockElementClassnames(Loader)
