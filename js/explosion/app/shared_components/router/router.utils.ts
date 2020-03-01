import { Route } from './router.types'
import { createBrowserHistory, History } from 'history'

const getWithLastSlash = (path: string): string => {
  if (path.charAt(path.length - 1) === '/') {
    return path
  }
  return path + '/'
}

export const matchRoute = (routePath: string, path: string, prefix: string): boolean => {
  if (!(routePath && path)) {
    return false
  }
  const fullpath = getWithLastSlash(prefix + routePath)
  const currentPath = getWithLastSlash(path)
  return fullpath === currentPath
}

const browserHistory: History<Route> = createBrowserHistory()

export const history = browserHistory
