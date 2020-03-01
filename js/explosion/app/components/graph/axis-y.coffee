React = require('react')
{div} = require('react-dom-factories')
Price = React.createFactory(require('react_components/price/price'))
PropTypes = require('prop-types')
createReactClass = require('create-react-class')

module.exports = React.createFactory(createReactClass(
  displayName: 'AxisY'

  propTypes:
    values: PropTypes.array.isRequired
    maxValue: PropTypes.number.isRequired
    minNeighborRelation: PropTypes.number # to not overlay near points
    highlightedPaddingTop: PropTypes.number

  render: ->
    div(
      className: 'graph__axis-y'
      for value, key in @_filterTooNearValues()
        div(
          className: 'graph__y-item'
          style: {top: @_top(value)}
          key: "graph__axis-y-#{key}"
          Price(valueInRubles: value)
        )
    )

  _filterTooNearValues: ->
    if @props.minNeighborRelation and @props.values.length > 1
      values = @props.values.sort((a, b) -> a - b)
      res = [values[0]]
      for i in [1..values.length]
        if (values[i] - res[res.length - 1]) / @props.maxValue >= @props.minNeighborRelation
          res.push(values[i])
      res
    else
      @props.values


  _top: (value) ->
    if @props.maxValue
      res = value / @props.maxValue * 100
    else
      res = 0
    if @props.highlightedPaddingTop
      res = res * (100 - @props.highlightedPaddingTop) / 100
    (100 - res) + '%'
))
