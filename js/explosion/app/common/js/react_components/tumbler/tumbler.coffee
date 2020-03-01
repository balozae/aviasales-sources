React = require('react')
{div, input, label} = require('react-dom-factories')
PropTypes = require('prop-types')
classNames = require('classnames')
BlockElementClassnames = require('react_components/mixins/block_element_classnames')
require('./tumbler.scss')
createReactClass = require('create-react-class')

# TODO: that component from form on main page, replace after extract form

module.exports = React.createFactory(createReactClass(
  displayName: 'Tumbler'
  propTypes:
    onChange: PropTypes.func.isRequired
    name: PropTypes.string
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    value: PropTypes.bool
    label: PropTypes.string
    disabled: PropTypes.bool
    className: PropTypes.string

  mixins: [BlockElementClassnames]

  getDefaultProps: ->
    name = "tumbler_#{(new Date()).getTime()}"
    name: name
    id: name
    value: false
    disabled: false
    label: ''
    className: ''

  handleChange: ({target}) ->
    @props.onChange(target.checked)

  render: ->
    div
      className: classNames(@blockClassName(), @props.className)
      input
        className: @elementClassName('input')
        type: 'checkbox'
        name: @props.name
        id: @props.id
        checked: @props.value
        disabled: @props.disabled
        onChange: @handleChange
      label
        className: @elementClassName('label')
        htmlFor: @props.id
        @props.label
      @props.children
))
