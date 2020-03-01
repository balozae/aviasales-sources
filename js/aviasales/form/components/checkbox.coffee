React = require('react')
createReactClass = require('create-react-class')
PropTypes = require('prop-types')
DOM = require('react-dom-factories')

Checkbox = createReactClass
  displayName: 'Checkbox'
  propTypes:
    checked: PropTypes.number
    onChange: PropTypes.func
    name: PropTypes.string
    id: PropTypes.string
    value: PropTypes.string
    uncheckedValue: PropTypes.string
    text: PropTypes.string
    className: PropTypes.string
    blockClassName: PropTypes.string

  getDefaultProps: ->
    checked: false
    blockClassName: 'of_input_checkbox'

  render: ->
    DOM.div
      className: "#{@props.blockClassName} #{@props.className}"
      DOM.input
        className: "#{@props.blockClassName}__input"
        type: 'checkbox'
        name: @props.name
        id: @props.id
        value: @props.value
        checked: Boolean(@props.checked)
        onChange: (event) =>
          checkbox = event.target
          @props.onChange(if checkbox.checked then 1 else 0)
      DOM.label
        className: "#{@props.blockClassName}__label"
        htmlFor: @props.id
        @props.text
      if @props.uncheckedValue
        DOM.input
          type: 'hidden'
          name: @props.name
          value: @props.uncheckedValue

module.exports = React.createFactory(Checkbox)
