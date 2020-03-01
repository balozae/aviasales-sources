# Actually we can just detect features for our application
# and don't parse user agent
require('@babel/polyfill')
{detect} = require('detect-browser')
i18n = require('i18n')
browser = detect()

i18n.init().then((t) ->
    # Equal or greater then version
    SUPPORTED_BROWSERS = {
      'opera': 20
      'ie': 11
      'firefox': 40
      'chrome': 40
      'safari': 6
    }
  
    if browser and browser.name and browser.version and SUPPORTED_BROWSERS[browser.name]
      supportedVersion = SUPPORTED_BROWSERS[browser.name]
      currentVersion = browser.version?.split('.')[0]
      isOldBrowser = supportedVersion and currentVersion and parseInt(currentVersion) < supportedVersion
    else
      isOldBrowser = false
    
    if isOldBrowser
      window.oldBrowserDetected = true
      notificationElement = document.createElement('div')
      document.body.appendChild(notificationElement)
      notificationElement.innerHTML =
        '<div class="old-browser-notification">
      <div class="old-browser-notification__inner">
        <a href="https://www.google.com/chrome" class="old-browser-notification__download" nofollow="nofollow" target="_blank">
        <p class="old-browser-notification__download-title">' + t('old_browser_notification:downloadChrome') + '</p>
        <span>' + t('old_browser_notification:useAutoUpdate') + '</span>
        </a>
        <p class="old-browser-notification__title">' + t('old_browser_notification:updateBrowser') + '</p>
        <p class="old-browser-notification__text">' + t('old_browser_notification:updateBrowserDesc') + '</p>
      </div>
      </div>'
      
      mamka?('send_event', {'name': 'OLD_BROWSER_NOTIFICATION_SHOWED', 'meta': {
        'browser': browser?.name,
        'version': browser?.version
      }})
)
