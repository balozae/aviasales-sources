metrics = (_action, actionType, args...) ->
  data = {}
  unless window.abBranch is ''
    data.ab_branch = window.abBranch
  unless window.clientAb is ''
    data.client_ab = window.clientAb
  switch actionType
    when 'event'
      [category, triggerAction, eventName, eventData] = args
      metric = "#{category}--#{eventName}--#{triggerAction}"
      for key, value of eventData when value?
        data[key] = value
    when 'timing'
      [category, timingVar, time, label] = args
      metric = "timing--#{category}--#{timingVar}--#{label}"
      data.time = time
  metric = encodeURIComponent(metric)
  mamka?('send_event', name: metric, meta: data)
  if window.customCounter
    window.customCounter.reachGoal(metric, data)

google = (action, actionType, args...) ->
  [category, event, label, data] = args
  type = typeof data?.valueOf()
  unless type is 'string' or type is 'number'
    if data?.hasOwnProperty('value')
      data = data?.value
    else
      data = undefined
  ga?(action, actionType, category, event, label, data)

if location.search.indexOf('debug') isnt -1
  debug = (args...) ->
    console['log']('Sending metric:', args)
else
  debug = ->

module.exports =
  google: google
  metrics: metrics
  debug: debug
