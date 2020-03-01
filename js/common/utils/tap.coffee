CustomEvent = require('utils/custom_event')
after = require('utils/after').default
MAX_DISTANCE = 10
EVENT_NAME = 'tap'

timer = undefined
startPosition = undefined

handleTouchEnd = (event) ->
  {clientX, clientY, target} = event.changedTouches[0]
  distance = Math.max(
    Math.abs(clientX - startPosition[0]),
    Math.abs(clientY - startPosition[1])
  )
  if distance < MAX_DISTANCE
    window.clearTimeout(timer)
    document.removeEventListener('touchend', handleTouchEnd, true)
    if target.hasAttribute('data-fast-focus')
      event.preventDefault()
      target.focus()
    else if target.hasAttribute('data-fast-click')
      event.stopPropagation()
      event.preventDefault()
      click = document.createEvent('HTMLEvents')
      click.initEvent('click', true, true)
      target.dispatchEvent(click)
    target.dispatchEvent(new CustomEvent(EVENT_NAME))

handleTouchStart = (event) ->
  window.clearTimeout(timer) if timer
  document.removeEventListener('touchend', handleTouchEnd, true)
  return unless event.touches.length is 1
  {clientX, clientY} = event.touches[0]
  startPosition = [clientX, clientY]
  document.addEventListener('touchend', handleTouchEnd, true)
  timer = after(500, ->
    document.removeEventListener('touchend', handleTouchEnd, true)
  )

module.exports =
  on: (element = document) ->
    element.addEventListener('touchstart', handleTouchStart, true)
  off: (element = document) ->
    element.removeEventListener('touchstart', handleTouchStart, true)
