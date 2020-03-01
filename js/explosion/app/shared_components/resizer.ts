import { useEffect } from 'react'
import breakpoints from 'shared_components/breakpoints'

export const defaultBreakpoints = {
  desktop: `(min-width: ${breakpoints.medium})`,
  tablet: `(min-width: ${breakpoints.small}) and (max-width: ${breakpoints.int.medium - 1}px)`,
  mobileLandscape: `(min-width: ${breakpoints.xsmall}) and (max-width: ${breakpoints.int.small -
    1}px)`,
  mobile: `(max-width: ${breakpoints.int.xsmall - 1}px)`,
}

export enum MediaQueryTypes {
  Mobile = 'mobile',
  MobileLandscape = 'mobileLandscape',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

interface BreakpointsConfig {
  [key: string]: string
}

type ResizerCallback = (mediaQueryKey: string, event: MediaQueryListEvent) => void

export class Resizer {
  private config = {}

  constructor(config: BreakpointsConfig) {
    Object.keys(config).forEach((mode: string) => {
      const media = config[mode]
      this.config[mode] = { media, enter: [], exit: [] }

      if (!window.matchMedia) {
        return
      }

      window.matchMedia(media).addListener((event: MediaQueryListEvent) => {
        // NOTE: delay enter callbacks, so exit callbacks runs first
        const [direction, delay] = event.matches ? ['enter', 50] : ['exit', 0]
        this.config[mode][direction].forEach((callback: ResizerCallback) =>
          window.setTimeout(callback.bind(null, mode, event), delay),
        )
      })
    })
  }

  onMode(modes: string, enterCallback?: ResizerCallback, exitCallback?: ResizerCallback): void {
    modes.split(', ').forEach((mode: string) => {
      this.checkMode(mode)
      if (enterCallback) {
        this.config[mode].enter.push(enterCallback)
      }
      if (exitCallback) {
        this.config[mode].exit.push(exitCallback)
      }
    })
  }

  offMode(modes: string, enterCallback?: ResizerCallback, exitCallback?: ResizerCallback): void {
    modes.split(', ').forEach((mode: string) => {
      this.checkMode(mode)
      if (enterCallback) {
        const callbeckIndex = this.config[mode].enter.findIndex(
          (action) => action === enterCallback,
        )
        if (callbeckIndex >= 0) {
          this.config[mode].enter.splice(callbeckIndex, 1)
        }
      }

      if (exitCallback) {
        const callbeckIndex = this.config[mode].exit.findIndex((action) => action === exitCallback)
        if (callbeckIndex >= 0) {
          this.config[mode].exit.splice(callbeckIndex, 1)
        }
      }
    })
  }

  currentMode(): string | undefined {
    return Object.keys(this.config).find((mode: string) => {
      const { media } = this.config[mode]

      if (!window.matchMedia) {
        return false
      }

      return window.matchMedia(media).matches
    })
  }

  matches(modes: string): boolean {
    return modes.split(', ').some((mode) => {
      this.checkMode(mode)

      if (!window.matchMedia) {
        return false
      }

      return window.matchMedia(this.config[mode].media).matches
    })
  }

  private checkMode(mode: string): void {
    if (!(mode in this.config)) {
      throw new Error(`Invalid mode ${mode}`)
    }
  }
}

export const useResizerOnEnter = (
  callback: ResizerCallback,
  modes: string = 'mobile, mobileLandscape, tablet, desktop',
  resizer: Resizer = defaultResizer,
) => {
  useEffect(() => {
    resizer.onMode(modes, callback)
    return () => resizer.offMode(modes, callback)
  }, [])
}

const defaultResizer = new Resizer(defaultBreakpoints)

export const isMobile = () => defaultResizer.matches('mobile, mobileLandscape')
export const isDesktop = () => defaultResizer.matches('desktop')

export default defaultResizer
