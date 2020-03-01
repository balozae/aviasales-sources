Cookie = require('oatmeal-cookie')
localStorageHelper = require('local_storage_helper')
triggerEvent = require('./stoyan_helpers')
dom_delegate = require('dom-delegate')

document_delegate = dom_delegate(document.body)

# NOTE: важный экспорт в глобал window!
window._stoyan_analytics = analytics =
  cookies:
    get: Cookie.get.bind(Cookie)
  search_params: {}
  auid: Cookie.get('auid') or ''
  targeting_params: {}
  currencies: {}

document_delegate.on('click', '[data-metainfo]', (e, el) ->
  metainfo = el.getAttribute('data-metainfo')
  try
    info = JSON.parse(metainfo)
    analytics.metainfo = info
    localStorageHelper.setJSONItem('metainfo', info)
  catch e
    Rollbar?.debug("Cannot parse metainfo: #{e.message}, metainfo: #{metainfo}")
  triggerEvent('price_click', info)
)

triggerEvent('init')

on_search_finished = ->
  triggerEvent('search_finished')

on_currencies_updated = (request_id, currencies) ->
  analytics.currencies = currencies
  localStorageHelper.setJSONItem('currencies', currencies)

on_start_search = (searchParams) ->
  analytics.search_params = searchParams
  triggerEvent('start_search')

on_update_tickets = (ticketPrices) ->
  triggerEvent('update_tickets', ticketPrices)

module.exports =
  on_start_search: on_start_search
  on_search_finished: on_search_finished
  on_currencies_updated: on_currencies_updated
  on_update_tickets: on_update_tickets
