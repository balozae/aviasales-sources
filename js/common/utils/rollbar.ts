interface Rollbar {
  critical: Function
  error: Function
  warn: Function
  warning: Function
  info: Function
  debug: Function
  configure: Function
}

declare global {
  interface Window {
    Rollbar: Rollbar
  }
}

const getRollbar = () => {
  const message = (level: string, err: any) => void 0

  const rollbar: Rollbar = {
    critical: (err: any) => {
      message('critical', err)
    },
    error: (err: any) => {
      message('error', err)
    },
    warn: (err: any) => {
      message('warning', err)
    },
    warning: (err: any) => {
      message('warning', err)
    },
    info: (err: any) => {
      message('info', err)
    },
    debug: (err: any) => {
      message('debug', err)
    },
    configure: (obj: any) => {
      message('configure', obj)
    },
  }

  if (window.Rollbar) {
    return window.Rollbar
  }
  return rollbar
}

export default getRollbar()
