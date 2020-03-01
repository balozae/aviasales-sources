declare global {
  interface Window {
    googletag: any
  }
}

var googletag = window.googletag || {}
googletag.cmd = googletag.cmd || []

var init = function() {
  googletag.cmd.push(function() {
    googletag.pubads().enableSingleRequest()
    googletag.pubads().disableInitialLoad()
    googletag.enableServices()
  })
}

export default init
