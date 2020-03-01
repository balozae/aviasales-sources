xhr = require('xhr')
forEach = require('lodash/forEach')
after = require('lodash/after')
localStorageHelper = require('local_storage_helper')
dispatcher = require('dispatcher').default
store = require('common/js/redux/store').default
{reachGoal} = require('common/js/redux/actions/metrics.actions')


do_measure_speed = Math.random() < 0.05 && localStorageHelper.getItem('inter_checked') != 'true' && performance?

if do_measure_speed
  localStorageHelper.setItem('inter_checked', 'true')

  statistics = {}

  hosts_map = {
    'skyscanner.ru': '//images.skyscnr.com/images/country/flag/header/ru.png',
    'momondo.ru': '//cdn1.momondo.net/i-3/images/sprites/flights-120822-2.png',
    'kayak.com': '//www.kayak.com/favicon.ico',
    'kayak.ru': '//www.kayak.ru/favicon.ico',
    'onetwotrip.ru': 'https://www.onetwotrip.com/images/seo/ico_loop.png',
    'kupibilet.ru': 'https://www.kupibilet.ru/favicon.ico', # bad cache
    'sindbad.ru': 'https://sindbad.ru/favicon.ico',
    'aviakassa.ru': 'https://www.aviakassa.ru/favicon.ico', # bad cache
    'tickets.ua': '//tickets.ua/favicon.ico', # bad cache
    'svyaznoy.travel': 'https://www.svyaznoy.travel/avia/styles/img/pass_menu-gender-male-gray.png',
    'ozon.travel': '//www.ozon.travel/images/fields/error.gif',
    'trip.ru': '//www.trip.ru/assets/redesign/icons/arrow_down-2518e6742e0f92d01f0ddd6a5f67e074.png',
    'aeroflot.ru': 'http://www.aeroflot.com/cms/sites/all/modules/booking_forms/images/calendar.png', # bad cache
    'ru.skypicker.com': '//ru.skypicker.com/images/general/ajax.gif'
  }

  is_from_cache = (img) ->
    [img.naturalWidth, img.naturalHeight, img.width, img.height, img.complete].some(Boolean)

  send_data = after(Object.keys(hosts_map).length, ->
    store.dispatch(reachGoal('USERS_INTERSECTION', statistics))
  )

  measure_load_speed = (url, label) ->
    start = performance.now()
    img = document.createElement('img')
    measure_speed = ->
      end = performance.now()
      diff = end - start
      statistics[label] = diff < 50 or statistics[label]
      send_data()

    img.onload = measure_speed
    img.onerror = send_data
    img.src = url

    statistics[label] = is_from_cache(img)
    true

module.exports = ->
  if do_measure_speed
    setTimeout(->
      forEach(hosts_map, measure_load_speed)
    , 5000)
