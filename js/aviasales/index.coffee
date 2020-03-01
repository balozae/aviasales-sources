'use strict'

require('explosion/app/components/explosion/explosion_polyfills')
require('@babel/polyfill')
require('perfnow')
require('utils/tap').on()
goalkeeper = require('goalkeeper/goalkeeper')
VKRetargeting = require('goalkeeper/vk_retargeting')
markerable = require('utils/markerable')
localStorageHelper = require('common/js/local_storage_helper.coffee')
require('classlist-polyfill')
require('intersection-observer')
require('common/utils/sendFlags')
{registerComponents, loadComponents} = require('utils/register_components')
initFinity = require('./finity_facade').default
require('aviasales-index.scss')
i18nInit = require('./i18n').init
mamka = require('mamka')
window.D = require('core/dispatcher')
lozad = require('lozad')
vendorResources = require('vendor_resources').default
{flagrInitProccess} = require('./flagr')

images = document.querySelectorAll('[data-src]');
observer = lozad(images);
observer.observe();

registerComponents(
  share_bar: require('share_bar/share_bar')
  woody: require('subscribe/woody')
  popup: require('popup/popup')
  subscribe_form: require('subscribe/form')
  main_news_form: require('subscribe/main_news_form')
  forms_set: require('form/forms_set').default
  subscribe_widget: require('from_city/subscribe_widget')
  mobile_apps: require('./mobile_apps_widget').default
  onboarding: require('onboarding/index').default
  app_slider: require('./app_slider/app_section.widget').default
)

init = ->
  window.Rollbar.global({itemsPerMinute: 5}) if window.Rollbar
  mamka('create', {
    project_name: 'aviasales_helios',
    debug: !(window.env and window.env.includes('prod'))
  })
  sysState = localStorageHelper.getItem('sysState') || '0'
  goalkeeper.setContext(
    nightMode: ['1', '2', '4'].indexOf(sysState) isnt -1
    nightModeState: sysState
  )
  goalkeeper.init()
  markerable.init()

  Promise.all([
    i18nInit(),
    flagrInitProccess
  ]).then(() ->
    initFinity()
    loadComponents(document)
  )

  require('vendor_resources/index.ts').default

if window.documentContentLoaded
  init()
else
  document.addEventListener 'DOMContentLoaded', ->
    init()


sendHit = ->
  VKRetargeting.Hit()
  window.removeEventListener('load', sendHit)

window.addEventListener('load', ->
  sendHit()
  vendorResources.loadAll()
)
