React = require('react')
{rect, line, g} = require('react-dom-factories')
PropTypes = require('prop-types')

_getHighlightStyle = ({dataSize, highlighted, step, marginRight}) ->
  [from, to] = highlighted
  length = Math.abs(to - from)
  {
    width: ((length+1) * step) - marginRight
    left: from * step
  }

module.exports = ({highlighted}) ->
  return null if !(highlighted and highlighted.length is 2)
  {width, left} = _getHighlightStyle.apply(this, arguments)
  g(null,
    rect(
      className: 'graph__highlighted'
      key: 'graph__highlighted'
      width: "#{width}%"
      height: "100%"
      x: "#{left}%"
      y: 0
    )
    line(
      className: 'graph__highlighted-border'
      key: 'graph__highlighted-border-1'
      x1: "#{left}%"
      x2: "#{left}%"
      y1: "0%"
      y2: "100%"
    )
    line(
      className: 'graph__highlighted-border'
      key: 'graph__highlighted-border-2'
      x1: "#{left + width}%"
      x2: "#{left + width}%"
      y1: "0%"
      y2: "100%"
    )
  )
