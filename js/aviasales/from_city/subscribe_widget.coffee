dispatcher = require('core/dispatcher')
PopupWidget = require('popup/popup')
requestAnimationFrame = require('raf')

class SubscribeWidget
  constructor: (@element) ->
    widget = {}
    widget.element = @element.querySelector('[data-role="subscribe"]')
    widget.height = widget.element.offsetHeight

    widget.wrapper = document.querySelector('[data-role="subscribe_widget_wrapper"]')
    widget.margins = parseInt(getComputedStyle(@element)['margin-top'], 10) +
      parseInt(getComputedStyle(widget.wrapper)['margin-top'], 10)

    social__tabs = document.querySelector('.social-widgets__tabs')
    widget.top_point = social__tabs.offsetTop + social__tabs.offsetHeight - 50

    page_content = widget.wrapper.querySelector('.page__content')
    bottom_padding_of_page_content = parseInt(getComputedStyle(page_content)['padding-bottom'], 10)
    widget.bottom_point = (widget.wrapper.offsetTop + widget.wrapper.offsetHeight) -
        (widget.height + widget.margins + bottom_padding_of_page_content)

    page_extra = widget.wrapper.querySelector('.page__extra')
    if page_content.offsetHeight > page_extra.offsetHeight
      window.addEventListener('scroll', ->
        requestAnimationFrame ->
          scroll_top = window.scrollY || document.documentElement.scrollTop || window.pageYOffset
          widget.top_point = social__tabs.offsetTop + social__tabs.offsetHeight - 50
          widget.bottom_point = (widget.wrapper.offsetTop + widget.wrapper.offsetHeight) -
            (widget.height + widget.margins + bottom_padding_of_page_content)
          if scroll_top >= widget.top_point and scroll_top < widget.bottom_point
            widget.element.classList.remove('is-fixed-on-bottom')
            widget.element.classList.add('is-fixed')
            widget.element.style.top = ''
          else if scroll_top < widget.top_point
            widget.element.classList.remove('is-fixed')
          else if scroll_top >= widget.bottom_point
            widget.element.classList.remove('is-fixed')
            widget.element.classList.add('is-fixed-on-bottom')
            widget.element.style.top = "#{widget.bottom_point + widget.margins}px"
        )

    @subscribePopup = new PopupWidget(widget.element)
    dispatcher.on('woody_widget_opened', => @subscribePopup.closeClickHandler())

module.exports = SubscribeWidget
