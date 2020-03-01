Cookie = require('oatmeal-cookie')
defer = require('common/utils/defer').default
GoalKeeper = require('goalkeeper/goalkeeper')

urlToDomain = (url) ->
  a = document.createElement('a')
  a.href = url
  a.hostname

# NOTE: https://aviasales.atlassian.net/browse/HEL-543 https://forum.awd.ru/
MARKER_PINGVINSKOGO = '174432'

Markerable =
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

  init: ->
    # NOTE: should also put safe markers at web/templates/pages/shared/iframe_kicker.html.eex
    safeMarkers = ['21794', '35544', '46735']
    safe = location.href.match(new RegExp('marker=(' + safeMarkers.join('|') + ')'))
    return if window.top isnt window.self and not safe
    defer @initMarkerableLinks.bind(this)
    @setMarkerCookie()
    marker = @getMarkerFromGetParams() or @getMarkerFromReferer()
    if @_isBadBoy(marker)
      marker = @_markerForBadBoy(marker)
    if marker
      @_setMarker(marker)

  getMarkerFromReferer: ->
    ref = document.referrer
    domain = urlToDomain(ref)
    return if /aviasales|hotellook|jetradar|localhost|avs\.io/.test(domain)
    marker = domain.replace(/\./, '_')
    checks =
      bing: /bing\./
      google: /^(www\.)?google\./
      mail: /go\.mail\.ru/
      rambler: /^(www\.)?(nova\.)?rambler\./
      yandex: /^(www\.)?yandex\./
    for engine, regex of checks when regex.test(domain)
      marker = engine
      break
    marker

  getMarkerFromGetParams: ->
    regex_result = /([&?])(?:marker|ref)=([^&]*)/.exec(document.location.search)
    return false unless regex_result
    [full_marker, sep, marker] = regex_result
    href = location.href.replace(full_marker, sep).replace('?&', '?').replace(/[?&]$/, '')
    window.history.replaceState?(null, null, href)
    marker

  setMarkerCookie: ->
    marker = Cookie.get('marker_value')
    expireDays = Cookie.fetch('marker_expires', 30, parseInt)
    @_setMarker(marker, expireDays)
    Cookie.expire('marker_value', path: '/')
    Cookie.expire('marker_expires', path: '/')

  _setMarker: (marker, expireDays = 30) ->
    # NOTE: https://aviasales.atlassian.net/browse/HEL-543 https://forum.awd.ru/
    expireDays = 60 if marker is MARKER_PINGVINSKOGO
    return unless marker?
    old_marker = @marker()
    return if @isAffiliate(old_marker) and not @isAffiliate(marker)
    cookieDomain = if location.hostname.substr(0, 3) is 'www'
      location.hostname.substr(3, location.hostname.length)
    else
      undefined
    if old_marker isnt marker
      GoalKeeper.triggerEvent('main', 'marker_was_set', 'change', {
        old_marker: old_marker
        new_marker: marker
      })
    @_marker = marker
    Cookie.set 'marker', marker,
      # NOTE: expires in days
      expires: expireDays * 86400
      domain: cookieDomain
      path: '/'

  initMarkerableLinks: ->
    marker = @marker()
    for link in document.querySelectorAll('a[data-markerable]')
      # TODO: handle links with anchors '#'
      separator = if link.href.indexOf('?') is -1 then '?' else '&'
      link.href += "#{separator}marker=#{marker}"

  marker: ->
    @_marker or Cookie.get('marker') or Cookie.get('marker_value') or 'direct'

  isAffiliate: (marker = @marker()) ->
    /^\d{5,}(\.|$)/.test(marker)

  _isBadBoy: (marker) ->
    marker and @isAffiliate(marker) and @_fromAdsSite() and not @_isValidAdsMarker(marker)

  _fromAdsSite: ->
    domainRegex = ///^https?:\/\/(#{@CONTEXTUAL_ADS_DOMAINS.join('|').replace(/\./g, '\\.')})///
    /[?&](gclid|yclid)=/.test(document.location.search) or domainRegex.test(document.referrer)

  _isValidAdsMarker: (marker) ->
    ///^(#{@VALID_CONTEXT_ADS_MARKERS.join('|')})///.test(marker)

  _markerForBadBoy: (marker) ->
    [
      @VALID_CONTEXT_ADS_MARKERS[0],
      'badboys' + marker.replace(/\./g, '_')
    ].join('.')

module.exports = Markerable
