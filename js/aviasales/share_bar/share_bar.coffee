share_lib = require('utils/share')
share_bar = (el) ->
  is_mobile = false
  share_lib(el, (network)->
    console.log('done share', network)
  , !is_mobile)

module.exports = share_bar
