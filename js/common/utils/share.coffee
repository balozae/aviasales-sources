dom_delegate = require('dom-delegate')
shares_count = require('shares-count')
goalkeeper = require('goalkeeper/goalkeeper')
share_window = null
check_interval = -1

_share = (url, callback) ->
  share_window = window.open(url, 'Sharing', 'width=740,height=440')
  clearInterval(check_interval)
  check_interval = setInterval((->
    if share_window.closed
      clearInterval(check_interval)
      callback() if callback
  ), 500)

share_networks =
  facebook:
    share: (url, opts, callback) ->
      _share(
        "https://www.facebook.com/dialog/feed?app_id=459009600951290&display=popup&link=#{encodeURIComponent url}&redirect_uri=#{encodeURIComponent('https://www.aviasales.ru/close_dialog.html')}" +
        (if opts.image then "&picture=#{encodeURIComponent opts.image}" else '') +
        (if opts.caption then "&caption=#{encodeURIComponent opts.caption}" else '') +
        (if opts.description then "&description=#{encodeURIComponent opts.description}" else '')
      , callback)
  twitter:
    share: (url, opts, callback) ->
      _share("https://twitter.com/intent/tweet?text=#{encodeURIComponent opts.texts}&url=#{encodeURIComponent url}", callback)
  vk:
    share: (url, opts, callback) ->
      _share(
        "https://vk.com/share.php?url=#{encodeURIComponent url}" +
        (if opts.image then "&image=#{encodeURIComponent opts.image}" else '') +
        (if opts.caption then "&title=#{encodeURIComponent opts.caption}" else '') +
        (if opts.description then "&description=#{encodeURIComponent opts.description}" else '')
      , callback)
  ok:
    share: (url, opts, callback) -> _share("https://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl=#{encodeURIComponent url}", callback)

on_close_share_window = (network, cb) ->
  cb(network) if cb

get_attribute = (attribute_name, el, default_value) ->
  t = el
  value = null
  while t
    value = t.getAttribute(attribute_name)
    break if value

    t = t.parentElement

  value || default_value

remove_params = (url) ->
  result = url.split('?')[0]
  result = result.split('#')[0]

init = (element, callback, counters = true) ->
  category = element.getAttribute('data-goal-category') || 'share_bar'
  delegate = dom_delegate(element)

  delegate.on('click', '[data-share]', (event, el) ->
    network_name = el.getAttribute('data-share')
    return unless share_networks[network_name]
    goalkeeper.triggerEvent(category, network_name)
    event.preventDefault()
    url = remove_params(get_attribute('data-share-url', el, window.location.href))
    page_title = document.querySelector('title')?.innerHTML
    og_title = document.querySelector('[property="og:title"]')?.getAttribute('content')
    default_share_text = if og_title then og_title else page_title
    share_text = get_attribute('data-share-text', el, default_share_text)
    data_image = get_attribute('data-image', el, null)
    data_caption = get_attribute('data-caption', el, null)
    data_description = get_attribute('data-description', el, null)
    share_networks[network_name].share(
      url,
      {
        texts: share_text,
        image: data_image,
        caption: data_caption,
        description: data_description
      },
      (-> on_close_share_window(network_name, callback))
    )
  )
  return unless counters
  for share_counter_el in element.querySelectorAll('[data-share-counter]')
    do (share_counter_el) ->
      counter_network = share_counter_el.getAttribute('data-share-counter')
      url = remove_params(get_attribute('data-share-url', share_counter_el, window.location.href))
      shown_shares_class = share_counter_el.getAttribute('data-show-shares-class')
      shares_count.get(counter_network, url, (shares_count) ->
        if shares_count > 0
          share_counter_el.textContent = shares_count
          share_counter_el.classList.add(shown_shares_class)
      )

module.exports = init
