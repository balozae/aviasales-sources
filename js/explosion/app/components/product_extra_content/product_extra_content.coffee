import React from 'react'
import debounce from 'debounce'
import {div} from 'react-dom-factories'
import BlockElementClassnames from 'react_components/mixins/block_element_classnames_decorator'
import AdContainerComponent from 'ad_container/ad_container'
import './product_extra_content.scss'

AdContainer = React.createFactory(AdContainerComponent)

BREAKPOINT_WIDTH = 1280

class ProductExtraContent extends React.Component
  @displayName: 'ProductExtraContent'

  constructor: (props) ->
    super(props)
    @state =
      isShow: window.innerWidth >= BREAKPOINT_WIDTH

  componentDidMount: ->
    @resizeCallback = debounce(=>
      isShow = false
      if window.innerWidth >= BREAKPOINT_WIDTH
        isShow = true
      if @state.isShow isnt isShow
        @setState({isShow})
    , 250)
    window.addEventListener('resize', @resizeCallback)

  componentWillUnmount: ->
    window.removeEventListener('resize', @resizeCallback)

  render: ->
    return null unless @state.isShow
    div
      className: @blockClassName()
      AdContainer
        name: 'extra_content'

export default BlockElementClassnames(ProductExtraContent)
