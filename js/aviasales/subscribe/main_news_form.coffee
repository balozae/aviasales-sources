SubscribeForm = require('./form')
metrics = require('metrics')

url = (email) ->
  'https://woody.aviasales.ru/subscriptions.jsonp?callback=news_form_callback' +
    "&recieve_news=true&news_source=archive&email=#{email}"

addScript = (src) ->
  elem = document.createElement('script')
  elem.src = src
  document.head.appendChild(elem)

class NewsForm extends SubscribeForm
  constructor: (widgetElement) ->
    form = widgetElement.querySelector('[data-role="main_news_form"]')
    super(form)
    @widgetElement = widgetElement
    window.news_form_callback = @newsFormCallback

  newsFormCallback: =>
    @widgetElement.classList.add('is-done')
    metrics.reach_goal('SUBSCRIBE_FORM', {action: 'success'})
    @doneHandler()

  showErrors: ->

  hideErrors: ->

  showLoader: ->
    @widgetElement.classList.add('is-show-loader')

  shakeMailIcon: ->
    @widgetElement.classList.add('is-error')

  successHandler: ->
    addScript(url(@form.email.value))

module.exports = NewsForm
