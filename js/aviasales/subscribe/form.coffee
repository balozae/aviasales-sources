guestia = require('guestia/client').default
dispatcher = require('core/dispatcher')
GoalKeeper = require('goalkeeper/goalkeeper')

EMAIL_REGEXP = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)*\w[\w-]*\.[a-z]+(\.[a-z]+)?$/i

class SubscribeForm
  constructor: (@form) ->
    @form.addEventListener('submit', @submitHandler.bind(this))
    @category = @form.getAttribute('data-goal-category') || 'subscrubeForm'
    if (email = guestia.getSettings('email'))
      @form.email.value = email
    @form.email.addEventListener 'focus', =>
      GoalKeeper.triggerEvent(@category, 'email', 'focus')
    @submit = @form.querySelector('input[type="submit"]')
    @submit.disabled = false

  isValid: ->
    @form.email.value.match(EMAIL_REGEXP)

  doneHandler: ->
    @submit.disabled = false

  successHandler: ->
    dispatcher.once('woody_widget_opened', @doneHandler, this)
    dispatcher.emit('subscribe_form_submitted')

  submitHandler: (event) ->
    event.preventDefault()
    GoalKeeper.triggerEvent(@category, 'search', 'allSubmits')
    if @isValid()
      @submit.disabled = true
      @hideErrors()
      guestia.setSettings('email', @form.email.value)
      GoalKeeper.triggerEvent(@category, 'search', 'submit')
      @successHandler()
      @showLoader()
    else
      @showErrors()
      @shakeMailIcon()

  showErrors: ->
    @_inputLabel().classList.add('is-invalid')

  hideErrors: ->
    @_inputLabel().classList.remove('is-invalid')

  showLoader: ->

  shakeMailIcon: ->

  _inputLabel: ->
    @__inputLabel ?= @form.querySelector('[data-role="emailLabel"]')

module.exports = SubscribeForm
