ELEMENT_SEPARATOR = '__'

CamelCaseToDash = (str) ->
  str.replace(/\.?([A-Z]+)/g, (x, y) -> '-' + y.toLowerCase()).replace(/^-/, '')

module.exports = (Component) ->
  this.blockClassName = (blockName = Component.displayName) ->
    Component.__blockClassName = CamelCaseToDash(blockName)

  this.elementClassName = (element) ->
    @blockClassName() unless Component.__blockClassName
    Component.__blockClassName + ELEMENT_SEPARATOR + element

  return =>
    Component.apply(this, arguments)
