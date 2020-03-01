ELEMENT_SEPARATOR = '__'

CamelCaseToDash = (str) ->
  str.replace(/\.?([A-Z]+)/g, (x, y) -> '-' + y.toLowerCase()).replace(/^-/, '')

module.exports =
  blockClassName: ->
    @__displayName ?= CamelCaseToDash(@constructor.displayName)

  elementClassName: (element) ->
    @blockClassName() + ELEMENT_SEPARATOR + element
