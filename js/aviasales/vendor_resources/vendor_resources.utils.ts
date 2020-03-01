import { LoadScriptOptions } from './vendor_resources.types'

const DEFAULT_LOAD_SCRIPT_OPTIONS: LoadScriptOptions = {
  element: document.body,
  async: true,
  defer: false,
}

export const loadScript = (url: string, opts: Partial<LoadScriptOptions>): HTMLScriptElement => {
  const options: LoadScriptOptions = { ...DEFAULT_LOAD_SCRIPT_OPTIONS, ...opts }
  const script = document.createElement('script')
  script.async = options.async
  script.defer = options.defer
  script.src = url
  if (options.id) {
    script.id = options.id
  }
  if (options.crossorigin) {
    script.crossOrigin = options.crossorigin
  }
  options.element.appendChild(script)
  return script
}
