require('utils/matches')
defer = require('utils/defer').default
extend = require('extend-object')
api = require('./api')
defaultConfig = require('./config')
{google, metrics, debug} = require('./metrics')

config = {}
_skipNextEvent = null

# TODO: probably should add target parameter as well
# TODO: better solution is to trigger events with custom data to skip them
skipNextEvent = (event) ->
  _skipNextEvent = event

matchTargetGoal = (type, target) ->
  for category, events of config
    if events._selectorPrefix
      parentSelector = "#{events._selectorPrefix}, #{events._selectorPrefix} *"
      continue unless target.matches(parentSelector)
    eventGoals = events[type] or {}
    for goalName, selector of eventGoals
      if events._selectorPrefix
        selector = selector.replace(/&/g, events._selectorPrefix)
      if target.matches(selector)
        value = target.getAttribute('data-event-value') ? undefined
        api.triggerEvent(category, goalName, type, value: value)
        return

isElementEvent = (target, type) ->
  target.hasAttribute('data-goal') and
    type is (target.getAttribute('data-goal-event') or 'click')

catchGoal = ({type, target}) ->
  # NOTE: skip initial document focus in firefox
  return unless 'matches' of target
  if _skipNextEvent and _skipNextEvent is type
    _skipNextEvent = null
    return
  if isElementEvent(target, type)
    api.triggerElementEvent(target)
    return
  matchTargetGoal(type, target)

init = (initConfig = defaultConfig) ->
  config = initConfig
  for metric in [metrics, debug]
    metric('send', 'event', 'page', 'loaded', 'pageView')
  for event in ['click', 'focus', 'submit', 'mousedown']
    document.addEventListener(event, catchGoal, true)

module.exports = extend({init: init, skipNextEvent: skipNextEvent}, api)
