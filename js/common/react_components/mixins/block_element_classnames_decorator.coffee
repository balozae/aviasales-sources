ELEMENT_SEPARATOR = '__'

CamelCaseToDash = (str) ->
  str.replace(/\.?([A-Z]+)/g, (x, y) -> '-' + y.toLowerCase()).replace(/^-/, '')

module.exports = (Component) ->
  Component::blockClassName = (blockName = @constructor.displayName) ->
    Component.__blockClassName = CamelCaseToDash(blockName)

  Component::elementClassName = (element) ->
    @blockClassName() unless Component.__blockClassName
    Component.__blockClassName + ELEMENT_SEPARATOR + element

  Component
