cookies = require('oatmeal-cookie')
cookieDomain = require('utils/cookie_domain')
store = require('common/js/redux/store').default
{reachGoal} = require('common/js/redux/actions/metrics.actions')

module.exports =
  default_marker: 'direct'
  VALID_CONTEXT_ADS_MARKERS: ['15468', '29086', '186703']
  CONTEXTUAL_ADS_DOMAINS: [
    'aviasales-tickets.ru',
    'google.com',
    'google.ru',
    'googleads.g.doubleclick.net',
    'googleadservices.co',
    'www.google.com',
    'www.google.ru',
    'www.googleadservices.co',
    'yandex.ru',
  ]

  get: -> cookies.fetch('marker', @default_marker)

  set: (value) ->
    old_marker = @get()
    return if old_marker is @_marker_for_bad_boy(value)
    marker = if @_is_bad_boy(value)
      @_marker_for_bad_boy(value)
    else
      value
    store.dispatch(reachGoal('MAKER_WAS_SET', {
      'old_marker': @get()
      'new_marker': marker
    }))
    cookies.set('marker', marker,
      expires: 60 * 60 * 24 * 30 # 30 days
      domain: cookieDomain
      path: '/'
    )
    value

  handle_marker: (value) ->
    if value and (@is_affiliate(value) or !@is_affiliate(@get()))
      return @set(value)
    if !cookies.get('marker')
      return @set(@default_marker)
    @get()

  _marker_for_bad_boy: (marker) ->
    "#{@VALID_CONTEXT_ADS_MARKERS[0]}.badboys#{marker}"

  _is_valid_ads_marker: (marker) ->
    ///^(#{@VALID_CONTEXT_ADS_MARKERS.join('|')})///.test(marker)

  _from_ads_site: ->
    domainRegex = ///^https?:\/\/(#{@CONTEXTUAL_ADS_DOMAINS.join('|').replace(/\./g, '\\.')})///
    /[?&](gclid|yclid)=/.test(document.location.search) or domainRegex.test(document.referrer)

  _is_bad_boy: (marker) ->
    marker and @is_affiliate(marker) and @_from_ads_site() and !@_is_valid_ads_marker(marker)

  is_affiliate: (marker) ->
    return false unless marker
    (/^\d{5,}(\.|$)/).test marker
