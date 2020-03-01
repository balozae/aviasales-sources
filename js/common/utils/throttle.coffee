module.exports = (fn, threshhold = 250, context = @) ->
  last = undefined
  deferTimer = undefined
  ->
    now = +new Date
    args = arguments
    if last and now < last + threshhold
      # hold on to it
      clearTimeout(deferTimer)
      deferTimer = setTimeout((->
        last = now
        fn.apply(context, args)
      ), threshhold)
    else
      last = now
      fn.apply(context, args)
