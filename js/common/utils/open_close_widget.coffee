after = require('utils/after').default

class OpenCloseWidget
  constructor: (@element) ->
    @openClickHandler = @openClickHandler.bind(this)
    @closeClickHandler = @closeClickHandler.bind(this)
    @trigger().addEventListener('click', @openClickHandler) if @trigger()

  openClickHandler: (event) ->
    event?.preventDefault()
    return if event is @_skipOpenEvent
    @trigger().removeEventListener('click', @openClickHandler)
    document.addEventListener('click', @closeClickHandler, true)
    document.addEventListener('tap', @closeClickHandler, true)
    @open()

  closeClickHandler: (event) ->
    if event
      {target} = event
      if @shouldClose(target)
        @_skipOpenEvent = event
        event.preventDefault() if @shouldPreventDefault(target)
      else
        return
    document.removeEventListener('click', @closeClickHandler, true)
    document.removeEventListener('tap', @closeClickHandler, true)
    @close()
    after 400, =>
      @trigger().addEventListener('click', @openClickHandler) if @trigger()

  open: ->
  close: ->
  trigger: ->
  dropdown: ->

  shouldClose: (target) ->
    role = target.getAttribute('data-role')
    role is 'close' or not @dropdown().contains(target)

  shouldPreventDefault: (target) ->
    @trigger().contains(target) or target.getAttribute('data-role') is 'close'

module.exports = OpenCloseWidget
