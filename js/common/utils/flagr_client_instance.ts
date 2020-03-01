import cookie from 'oatmeal-cookie'
import Flagr from 'shared_components/flagr/Flagr'
import { defaultUserAccountRoutesArray } from 'user_account/constants/routes'

declare let FLAGR_HOST: string

const userAgent = {
  browser: 'unknown',
  os: 'unknown',
  device: 'desktop',
}

try {
  const results = require('ua_parser').userAgent()

  userAgent.browser = results.browser.name
  userAgent.os = results.os.name
  userAgent.device = results.platform === 'pc' ? 'desktop' : results.platform
} catch (e) {
  //
}

const basicContext = {
  ...userAgent,
}

const flagrConfig = {
  evaluateUrl: FLAGR_HOST,
}

const instance = new Flagr(cookie.get('auid'), basicContext, flagrConfig)

instance
  .add('avs-exp-badges', false)
  .add('avs-exp-calendarNavArrows', false)
  .add('avs-exp-rentalcarsPopup', false)
  .add('avs-exp-subscriptionFormSidebar', false)
  .add('avs-exp-pushNotifications', false)
  .add('avs-feat-currencySwitcher', true)
  .add('avs-feat-langSwitcher', false)
  .add('avs-feat-creditLink', false)
  .add('avs-feat-openSearch', false)
  .add('avs-feat-topMenu', false)
  .add('avs-feat-userProfile', false)
  .add('avs-feat-mediaAlpha', false)
  .add('avs-feat-subscription', false)
  .add('avs-feat-needVisa', false)
  .add('avs-feat-formTabs', { tabs: ['avia', 'hotel'] })
  .add('avs-feat-appSectionImgLang', 'ru')
  .add('avs-feat-loginMethods', {
    methods: ['vk', 'facebook', 'twitter', 'ok', 'google', 'mail_ru', 'yandex'],
  })
  .add('avs-feat-socialsList', {
    socials: [
      { type: 'vk', url: 'https://vk.com/aviasalesru' },
      { type: 'fb', url: 'https://www.facebook.com/aviasales.ru' },
      { type: 'ig', url: 'https://instagram.com/aviasales' },
      { type: 'tw', url: 'https://twitter.com/aviasales' },
      {
        type: 'vb',
        url:
          'https://invite.viber.com/?g2=AQAtX3IQDoKIAkjNZmzOMFaqi9OHuUKPrggGpt4kfnukhlsf0gueU8hnc6dLdcqt',
      },
    ],
  })
  .add('avs-feat-mediaAlphaPlacementsIds', {
    bottom_inline: {
      placement_id: 'OBe5C8wHCfcjJTk9O4IiFkV6sp5TuA',
    },
    extra_content: {
      placement_id: 'FOt1zTFxS_zUy909UUTLkkeHm0tX7w',
    },
    preroll: {
      placement_id: '4GCVL0uQwS-2gFsxmOR2aF0iriLw5Q',
    },
    product_3: {
      placement_id: '4i6eQ1CeaSyzqdYoXSUbx1z-TC7NsQ',
    },
  })
  .add('avs-exp-aa', false)
  .add('avs-exp-aa2', false)
  .add('avs-feat-appleSignIn', false)
  .add('avs-exp-formCheckboxHotelsText', false)
  .add('avs-feat-userAccountRoutes', {
    routes: defaultUserAccountRoutesArray,
  })
  .add('avs-feat-tripClasses', {
    tripClasses: [
      { code: 'Y', name: 'Economy' },
      { code: 'W', name: 'PremiumEconomy' },
      { code: 'C', name: 'Business' },
      { code: 'F', name: 'FirstClass' },
    ],
  })
  .add('avs-feat-appLinks', {
    ios: {
      host: 'https://app.appsflyer.com/id498958864',
      params: {
        pid: 'avaisales',
        c: 'homepage',
        af_sub1: cookie.get('marker'),
      },
    },
    android: {
      host: 'http://app.appsflyer.com/ru.aviasales',
      params: {
        pid: 'avaisales',
        c: 'homepage',
        af_sub1: cookie.get('marker'),
      },
    },
  })
  .add('avs-feat-intent', false)

export default instance
