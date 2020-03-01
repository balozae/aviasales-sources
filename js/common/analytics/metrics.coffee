delegate = require('dom-delegate')
FBPixel = require('./facebook_pixel')
localStorageHelper = require('local_storage_helper')
memoize = require('lodash/memoize')
mamka = require('mamka')
{ isMobile } = require('shared_components/resizer')

M2G_MAP =
  TICKET_LOGO_CLICK: ['click', 'buy_ticket']
  TICKET_BUY_BUTTON_CLICK: ['click', 'buy_ticket']
  TICKET_PROPOSAL_CLICK: ['click', 'buy_ticket']
  TICKET_BUY_BUTTON_CONTEXTMENU: ['contextmenu', 'buy_ticket']

M2Y_MAP =
  SEARCH_STARTED: 'search_page--start--search'
  TICKET_LOGO_CLICK: 'search_page--click--buy_ticket'
  TICKET_BUY_BUTTON_CLICK: 'search_page--click--buy_ticket'
  TICKET_PROPOSAL_CLICK: 'search_page--click--buy_ticket'
  TICKET_BUY_BUTTON_CONTEXTMENU: 'search_page--contextmenu--buy_ticket'

extendedEventData = {
  ab_branch: window.abBranch if window.abBranch
  client_ab: window.clientAb if window.clientAb
  is_mobile: isMobile()
}

sendEventToYm = (goalName) ->
  if window.yaCounter
    window.yaCounter.reachGoal(goalName)
  else if window.yandex_metrika_callbacks
    window.yandex_metrika_callbacks.push(->
      window.yaCounter?.reachGoal(goalName)
    )
  else if window.yandex_metrika_callbacks2
    window.yandex_metrika_callbacks2.push(->
      window.yaCounter?.reachGoal(goalName)
    )
  else
    console.log("Failed to send goal with name '#{goalName}' to YM")

sendEventToGa = (goalName) ->
  if window._rollbarMetricsHistory
    window._rollbarMetricsHistory.push(goalName)
    if window._rollbarMetricsHistory.length > 10
      window._rollbarMetricsHistory.splice(0, 1)
  ga?('send', 'event', 'search_page',
    (M2G_MAP[goalName]?[0] or 'click'), (M2G_MAP[goalName]?[1] or goalName.toLowerCase())
  )

eventDebug = if localStorageHelper.getItem('debugMetrics')
  (goalName, data = {}, type = 'metric') -> console.log(type, goalName, data)
else
  ->

sendTiming = (name, value) ->
  ga?('send', 'timing', 'search_page', name, value, undefined)
  data = {
    ...extendedEventData
    time: value
  }
  mamka('send_event', name: name, meta: data)
  eventDebug(name, data, 'timing')

reachMetricGoal = (goalName, data = {}) ->
  data = {
    ...extendedEventData
    ...data
  }
  sendEventToGa(goalName)
  sendEventToYm(M2Y_MAP[goalName] or goalName.toLowerCase())
  # GoalKeeper.setContext({ 'nightMode': nightModeOn, nightModeState: this.props.sysState })
  mamka('send_event', name: goalName, meta: data)
  eventDebug(goalName, data)

reachGoalOnUrl = (goalName, data = {}, url) ->
  sendEventToGa(goalName.toLowerCase())
  data = {
    ...extendedEventData
    ...data
  }
  localStorageHelper.setJSONItem(url, {data, goal_name: "EXPL_#{goalName}"})
  eventDebug(goalName, data, 'onUrl')

init = ->
  reachMetricGoal('PAGEVIEW')
  delegate(document.body).on('click', '[metric]', (event, target) ->
    reachMetricGoal(target.getAttribute('metric'), target.dataset)
  )

module.exports =
  init: init
  reach_goal: reachMetricGoal
  reach_goal_once: memoize(reachMetricGoal, (args...) -> JSON.stringify(args))
  send_timing: sendTiming
  reach_goal_on_url: reachGoalOnUrl
  FBPixel: FBPixel
