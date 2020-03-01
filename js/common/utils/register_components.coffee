extend = require('extend-object')
defer = require('utils/defer').default
components = {}

module.exports =
  registerComponents: (components_map) ->
    extend(components, components_map)
  loadComponents: (element) ->
    for component in element.querySelectorAll('[is], [data-content-widget]')
      do (component) ->
        name = component.getAttribute('is') or component.getAttribute('data-content-widget')
        if components[name] instanceof Function
          defer ->
            new components[name](component)
        else
          console.warn("There is no constructor for component #{name}")
