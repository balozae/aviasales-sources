import TripParams from 'utils/trip_params'
dispatcher = require('core/dispatcher')
PopupWidget = require('popup/popup')
delegate = require('dom-delegate')
guestia = require('guestia/client').default

class WoodyWidget
  constructor: (element) ->
    dispatcher.on('subscribe_form_submitted', @open, this)
    @defaultParams = TripParams.getSubscribeParams()
    triggerQuery = element.getAttribute('data-trigger-query')
    if triggerQuery
      emailMatch = window.location.search.match(new RegExp("#{triggerQuery}=([^&$]*)", 'i'))
      isUnsubscribe = (new RegExp('unsubscribe=true', 'i')).test(window.location.search)
      if emailMatch
        email = decodeURIComponent(emailMatch[1])
        email = if email.indexOf('@') is -1 then window.atob(email) else email
        if email.indexOf('@') is -1 #Because there's could be parsing error after previous step
          @openErrorPopup()
        else
          params = Object.assign({}, {params: @defaultParams}, {email: email})
          params = Object.assign(params, options: {unsubscribe: true}) if isUnsubscribe
          guestia.setSettings('email', email)
          @open(params)

  openErrorPopup: ->
    unless @errorPopup
      popupElem = document.getElementById('popup-subscribe-error')
      @errorPopup = new PopupWidget(popupElem)
      form = popupElem.querySelector('#subscribe-form-error')
      form.addEventListener('submit', (e) =>
        e.preventDefault()
        email = form.email.value
        guestia.setSettings('email', email)
        @open()
        setTimeout(() =>
          @errorPopup.close()
        1000)
      )
    @errorPopup.open()

  open: (params = {params: @defaultParams}, openCallback) ->
    iframe = @_iframe(params, openCallback)
    document.body.appendChild(iframe)

  _removeIframe: (iframe) ->
    iframe.parentNode.removeChild(iframe)

  _iframe: (params, openCallback) ->
    paramsJSON = encodeURIComponent(JSON.stringify(params))
    iframe = document.createElement('iframe')
    iframe.id = 'popup-subscribe-iframe'
    iframe.className = 'popup-subscribe-iframe'
    iframe.src = "/subscribe_widget.html?subscribe_params=#{paramsJSON}"
    iframe.setAttribute('allowtransparency', 'true')
    iframe.onload = =>
      dispatcher.emit('woody_widget_opened')
      delegate(iframe.contentDocument).on('click', '.woody__icon-close', =>
        @_removeIframe(iframe)
      )
      openCallback?()
    iframe.onabort = => @_removeIframe(iframe)
    iframe

module.exports = WoodyWidget
