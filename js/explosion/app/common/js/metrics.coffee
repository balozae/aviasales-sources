delegate = require('dom-delegate')
dispatcher = require('dispatcher').default
debounce = require('debounce')
localStorageHelper = require('local_storage_helper')
VKRetargeting = require('goalkeeper/vk_retargeting')
store = require('redux/store').default
mamka = require('mamka')

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

eventDebug = if store?.getState().debugSettings.debugMetrics
  (goalName, data = {}, type = 'metric') -> console.log(type, goalName, data)
else
  ->

sendTiming = (name, value) ->
  ga?('send', 'timing', 'search_page', name, value, undefined)
  data = {time: value}
  data.ab_branch = window.AB_BRANCH if window.AB_BRANCH
  mamka?('send_event', name: name, meta: data)
  eventDebug(name, data, 'timing')

reachMetricGoal = (goalName, data = {}) ->
  data.ab_branch = window.AB_BRANCH if window.AB_BRANCH
  sendEventToGa(goalName)
  sendEventToYm(M2Y_MAP[goalName] or goalName.toLowerCase())
  mamka?('send_event', name: goalName, meta: data)
  eventDebug(goalName, data)

reachGoalOnUrl = (goalName, data = {}, url) ->
  sendEventToGa(goalName.toLowerCase())
  data.ab_branch = window.AB_BRANCH if window.AB_BRANCH
  localStorageHelper.setJSONItem(url, {data, goal_name: "EXPL_#{goalName}"})
  eventDebug(goalName, data, 'onUrl')

init = ->
  reachMetricGoal('PAGEVIEW')
  VKRetargeting.Hit()
  delegate(document.body).on('click', '[metric]', (event, target) ->
    reachMetricGoal(target.getAttribute('metric'), target.dataset)
  )

renderId = 1

viewportEventData = (ticket) ->
  [
    't',
    ticket[0].sign,
    (gate_id for {gate_id} in ticket[1]).join(',')
  ].join('|')

SEND_TICKETS_AMOUNT = 20

ticketsUpdatedHandler = (event, {request_id, tickets, reason}) ->
  count = 0
  ticketsData = for ticket, index in tickets
    break if count++ is SEND_TICKETS_AMOUNT
    viewportEventData(ticket)
  storeState = store?.getState()
  eventData =
    yasen_uuid: storeState.searchId
    renderId: renderId++
    reason: reason
    active_filters: storeState.filters.changedFilters
    elements: ticketsData
  reachMetricGoal('VIEWPORT_RENDER', eventData)

#до того как выдача отредерится идет куча перерисовок, поэтому дебоунц 10s, потом 5s
debounced5s = debounce(ticketsUpdatedHandler, 5000)
debounced10s = debounce(ticketsUpdatedHandler, 10000)

prevRequestId = null
prevSearchStatus = null
store?.subscribe( ->
  searchStatus = store.getState().searchStatus
  requestId = store.getState().requestId
  if requestId and requestId isnt prevRequestId
    renderId = 1
    dispatcher.off(debounced5s)
    dispatcher.off(debounced10s)
    dispatcher.on('tickets_updated', debounced10s)
  if prevSearchStatus isnt searchStatus and searchStatus is 'FINISHED'
    dispatcher.off(debounced10s)
    dispatcher.on('tickets_updated', debounced5s)
  prevSearchStatus = searchStatus
  if requestId
    prevRequestId = requestId
)

module.exports =
  init: init
  reach_goal: reachMetricGoal
  send_timing: sendTiming
  reach_goal_on_url: reachGoalOnUrl
