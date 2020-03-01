React = require('react')
{svg, rect, g} = require('react-dom-factories')
PropTypes = require('prop-types')
classNames = require('classnames')
PureRenderMixin = require('react-addons-pure-render-mixin')
createReactClass = require('create-react-class')

module.exports = React.createFactory(createReactClass(
  displayName: 'AxisX'

  propTypes:
    values: PropTypes.array.isRequired
    onClick: PropTypes.func
    onHover: PropTypes.func
    maxValue: PropTypes.number.isRequired
    width: PropTypes.number.isRequired
    step: PropTypes.number.isRequired
    highlightedPaddingTop: PropTypes.number
    sizeType: PropTypes.string.isRequired
    offsetX: PropTypes.number
    minHeight: PropTypes.number
    marginRight: PropTypes.number
    graphClassName: PropTypes.string

  mixins: [PureRenderMixin]

  render: ->
    svg(
      className: 'graph__axis-x'
      svg(
        height: "#{100 - @props.highlightedPaddingTop}%"
        y: "#{@props.highlightedPaddingTop}%"
        x: "#{@props.offsetX}#{@props.sizeType}"
        for col, i in @props.values
          {key, value, className} = col
          height = if value then Math.min(1, value / @props.maxValue) * 100 else 0
          height = @props.minHeight if height < @props.minHeight
          if @props.graphClassName is '--prediction'
            [
              rect(
                className: classNames(
                  'graph__col'
                  '--empty': not value
                  className
                )
                key: key
                onClick: @handleClick.bind(this, i)
                onMouseOver: @handleMouseOver.bind(this, i)
                onMouseOut: @handleMouseOut
                width: "#{@props.width + @props.marginRight}#{@props.sizeType}"
                height: '100%'
                y: '0%'
                x: "#{@props.step * i}#{@props.sizeType}"
              )
              rect(
                className: 'graph__col-white'
                key: "#{key}1"
                width: "#{@props.width + @props.marginRight}#{@props.sizeType}"
                height: "#{100 - height}%"
                y: '0%'
                x: "#{@props.step * i}#{@props.sizeType}"
              )
              rect(
                className: 'graph__col-white'
                key: "#{key}2"
                width: "1#{@props.sizeType}"
                height: '100%'
                y: '0%'
                x: "#{@props.step * i}#{@props.sizeType}"
              )
            ]
          else
            rect(
              className: classNames(
                'graph__col'
                '--empty': not value
                className
              )
              key: key
              onClick: @handleClick.bind(this, i)
              onMouseOver: @handleMouseOver.bind(this, i)
              onMouseOut: @handleMouseOut
              width: "#{@props.width}#{@props.sizeType}"
              height: "#{height}%"
              y: "#{100 - height}%"
              x: "#{@props.step * i}#{@props.sizeType}"
            )
      )
      @props.children
    )

  handleMouseOver: (i, e) -> @props.onHover(i, e.target)
  handleMouseOut: -> @props.onHover(null)
  handleClick: (i) -> @props.onClick(i, @props.values[i])
))