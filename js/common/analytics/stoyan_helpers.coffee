# Trigger event for Stoyan Analytics
# Pass any args to stoyan's callbacks
triggerEvent = (eventName, args...) ->
  _stoyan?.queue
    .filter(([event, ...]) -> event is eventName)
    .forEach(([event, callback]) ->
      try
        callback(args...)
      catch e
        warning("ERROR in Stoyan Code (#{eventName}):\n" + e.message)
    )

  _stoyan?.initialized = true if eventName is 'init'

  # TODO: Remove this code after migrating on _stoyan
  if window._analytics_callbacks?["on_#{eventName}"]
    for cb in window._analytics_callbacks["on_#{eventName}"]
      try
        cb(args...)
      catch e
        Rollbar?.debug('Error in analytics code: ' + e.message)
        console.warn('Error in analytics code: ' + e.message)

warning = (message) ->
  Rollbar?.debug(message)
  console.warn(message)

module.exports = triggerEvent
