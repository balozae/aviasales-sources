try
  window.CustomEvent.new('test')
catch
  CustomEvent = (type, eventInit) ->
    newEvent = document.createEvent('CustomEvent')
    newEvent.initCustomEvent(type,
      !!(eventInit and eventInit.bubbles)
      !!(eventInit and eventInit.cancelable)
      eventInit?.details
    )
    newEvent
  CustomEvent.prototype = window.Event.prototype;

module.exports = CustomEvent
