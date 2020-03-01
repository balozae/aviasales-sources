// eslint-disable-next-line camelcase
const { reach_goal } = require('./metrics')

const checkHeadlessBrowser = () => {
  let criterion = 0

  if (/PhantomJS/.test(window.navigator.userAgent)) {
    criterion = 1 // PhantomJS User Agent
  }

  if (/HeadlessChrome/.test(window.navigator.userAgent)) {
    criterion = 2 // Headless Chrome User Agent
  }

  if (navigator.languages === '') {
    criterion = 3 // No languages in browser
  }

  if (!(navigator.plugins instanceof PluginArray)) {
    criterion = 4 // No plugins in browser (Not instanceof PluginArray)
  }

  if (navigator.plugins.length === 0) {
    criterion = 5 // No plugins in browser (Length 0)
  }

  if (window.callPhantom) {
    criterion = 6 // window.callPhantom method detected
  }
  // eslint-disable-next-line no-underscore-dangle
  if (window._phantom) {
    criterion = 7 // window._phantom property detected
  }

  if (window.Buffer) {
    criterion = 8 // window.Buffer property detected
  }
  if (window.emit) {
    criterion = 9 // window.emit property detected
  }

  if (window.spawn) {
    criterion = 10 // window.spawn method detected
  }

  if (window.webdriver) {
    criterion = 11 // window.webdriver property detected
  }

  if (window.domAutomation) {
    criterion = 12 // window.domAutomation property detected
  }

  if (window.domAutomationController) {
    criterion = 13 // window.domAutomationController property detected
  }

  let err
  try {
    null[0]()
  } catch (e) {
    err = e
  }

  if (err.stack && err.stack.indexOf('phantomjs') > -1) {
    criterion = 14 // Call stack has phantomjs substring
  }

  if (criterion !== 0) {
    reach_goal('KOLMAKOVE', { number: criterion })
  }
}

export default checkHeadlessBrowser
