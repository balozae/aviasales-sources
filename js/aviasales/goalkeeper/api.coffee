{google, metrics, debug} = require('./metrics')
extend = require('extend-object')

timing = {}
context = {}

autoTiming =
  aviaFormFilling:
    start: ['avia_form', null, null]
    trigger: ['avia_form', 'submit', 'search']
  startFormInteraction:
    start: null
    trigger: ['avia_form', null, null]

timingSpecPartMatch = (pattern, value) ->
  pattern is null or pattern is value or (
    pattern instanceof RegExp and value.match(pattern)
  )

timingSpecMatch = ([specCategory, specAction, specLabel], category, action, label) ->
  timingSpecPartMatch(specCategory, category) and
    timingSpecPartMatch(specAction, action) and
    timingSpecPartMatch(specLabel, label)

goalCategory = (element, goalAttribute = 'data-goal-category') ->
  return 'main' if element is document or not element
  if element.hasAttribute(goalAttribute)
    element.getAttribute(goalAttribute)
  else
    goalCategory(element.parentNode, goalAttribute)

time = (label) ->
  timing[label] = Date.now()

timeEnd = (label, timingCategory = 'main', timingVar = label, timingLabel) ->
  unless timing[label]
    console.warn('No timer was started for label %s', label)
    return
  time = Date.now() - timing[label]
  timing[label] = null
  for metric in [google, metrics, debug]
    metric('send', 'timing', timingCategory, timingVar, time, timingLabel)

checkAutoTiming = (category, action, label) ->
  for label, {start, trigger} of autoTiming
    if start and timingSpecMatch(start, category, action, label)
      time(label) unless timing[autoTiming]
    if timingSpecMatch(trigger, category, action, label)
      timeEnd(label, category, autoTiming, label) if timing[autoTiming]


triggerEvent = (category, eventName, action = 'click', data = {}) ->
  checkAutoTiming(category, action, eventName)
  for metric in [google, metrics, debug]
    metric('send', 'event', category, action, eventName, extend({}, context, data))

setContext = (data) ->
  context = data

triggerElementEvent = (element) ->
  value = element.getAttribute('data-event-value') ? undefined
  goalName = element.getAttribute('data-goal')
  event = element.getAttribute('data-goal-event') or 'click'
  triggerEvent(goalCategory(element), goalName, event, value: value)

module.exports =
  triggerEvent: triggerEvent
  triggerElementEvent: triggerElementEvent
  time: time
  timeEnd: timeEnd
  setContext: setContext
