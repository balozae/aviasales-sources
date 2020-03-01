import React from 'react'
import classNames from 'classnames'
import {div} from 'react-dom-factories'
import viewport from 'browser-viewport'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import './go_to_top_button.scss'

SCROLL_TO_TOP_SPEED = 500 #ms
SHOW_POSITION = 500 #px

class GoToTopButton extends React.Component
  @displayName: 'GoToTopButton'

  constructor: (props) ->
    super(props)
    @state =
      isHidden: true

  scrollHandle: (e) =>
    isHidden = window.pageYOffset < SHOW_POSITION
    if isHidden isnt @state.isHidden
      @setState({isHidden})

  componentDidMount: ->
    window.addEventListener('scroll', @scrollHandle)

  componentWillUnmount: ->
    window.removeEventListener('scroll', @scrollHandle)

  render: ->
    div
      onClick: -> viewport.scrollTop(0, SCROLL_TO_TOP_SPEED)
      className: classNames(@blockClassName(), {'is-hidden': @state.isHidden})

export default BlockElementClassnames(GoToTopButton)
