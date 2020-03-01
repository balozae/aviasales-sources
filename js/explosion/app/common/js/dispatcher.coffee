export default {
  subscribers: {}

  on: (eventName, callback) ->
    (@subscribers[eventName] = @subscribers[eventName] or []).push(callback)
    callback

  off: (callback) ->
    for eventName of @subscribers
      eventSubscribers = @subscribers[eventName]
      for i, eventSubscriber of eventSubscribers
        if eventSubscriber is callback
          eventSubscribers.splice(i, 1)

  all: (callback) ->
    @on('*', callback)

  send: (eventName, data, source) ->
    eventSubscribers = (@subscribers[eventName] or []).concat(@subscribers['*'] or [])
    for eventSubscriber in eventSubscribers
      eventSubscriber(eventName, data, source, eventSubscribers)
}
