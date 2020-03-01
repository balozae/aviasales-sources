require('./popup.scss')
OpenCloseWidget = require('utils/open_close_widget')

calculateTopPosition = (popupDiv) ->
  defaultPosition = 20
  position = (window.innerHeight - popupDiv.offsetHeight) / 2
  if position < 0 then defaultPosition else position

getPopupElement = (elementOrId) ->
  if elementOrId?.nodeName
    elementOrId
  else
    document.getElementById(elementOrId)

Popup =
  open: (elementOrId, content) ->
    popup = getPopupElement(elementOrId)
    return unless popup
    calculatePosition = popup.getAttribute('data-calculate-position') isnt 'false'
    document.body.classList.add('is-popped')
    document.body.classList.add('is-fixed-body') unless calculatePosition
    popup.classList.add('is-opened')
    if calculatePosition
      content.style.marginTop = "#{calculateTopPosition(content)}px"

  close: (elementOrId) ->
    popup = getPopupElement(elementOrId)
    return unless popup
    document.body.classList.remove('is-popped', 'is-fixed-body')
    popup.classList.remove('is-opened')

class PopupWidget extends OpenCloseWidget
  constructor: (element) ->
    return unless element
    super(element)
    @popupId = element.getAttribute('data-popup-id')
    triggerQuery = element.getAttribute('data-trigger-query')
    if triggerQuery and location.search.indexOf(triggerQuery) isnt -1
      @_skipOpenEvent = false
      @openClickHandler()
    @element.classList.remove('wait')

  trigger: -> @element

  dropdown: ->
    @_content ?= @popup().querySelector('[data-role="popup"]')

  popup: ->
    @_popup ?= document.getElementById("popup-#{@popupId}")

  open: -> Popup.open(@popup(), @dropdown())

  close: -> Popup.close(@popup())

module.exports = PopupWidget
