import { VendorResourceLoaderState, LoadScriptOptions } from './vendor_resources.types'
import { loadScript } from './vendor_resources.utils'
import rollbar from 'common/utils/rollbar'

class VendorResourceLoader {
  state: VendorResourceLoaderState = {}

  loadScript(url: string, options: Partial<LoadScriptOptions> = {}) {
    try {
      const script = loadScript(url, { ...options, element: document.body })
      if (options.id) {
        this.state[options.id] = { script, isLoaded: false }
      }
      script.addEventListener('load', this.handleScriptLoaded(options.id))
    } catch (error) {
      rollbar.warn('Load script error', error)
    }
  }

  handleScriptLoaded = (id: string | undefined, fn: Function = () => void 0) => (event: Event) => {
    if (id && this.state[id]) {
      this.state[id].isLoaded = true
      fn()
    }
  }

  loadAll() {
    this.loadScript('https://www.google-analytics.com/analytics.js')
    this.loadScript(`https://www.googletagmanager.com/gtm.js?id=${window.gtmId}`)
    this.loadScript('//static.criteo.net/js/ld/publishertag.js')
    this.loadScript('https://www.googletagservices.com/tag/js/gpt.js', { id: 'googletagservices' })
    this.loadScript('https://mc.yandex.ru/metrika/watch.js')
    if (!window.isMainPage && !window.isSearchPage) {
      this.loadScript('//static.clicktripz.com/custom/aviasales_ru/cti_aviasales_ru.js')
    }
    try {
      window.initFBPixel()
    } catch {
      //
    }
  }

  waitForResource(id: string): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      const resource = this.state[id]
      if (!resource) {
        reject(`Unknown resource id ${id}`)
      }
      if (resource.isLoaded) {
        setTimeout(() => resolve(resource.script), 50)
      } else {
        resource.script.addEventListener(
          'load',
          this.handleScriptLoaded(id, () => {
            setTimeout(() => resolve(resource.script), 50)
          }),
        )
      }
    })
  }
}

export default VendorResourceLoader
