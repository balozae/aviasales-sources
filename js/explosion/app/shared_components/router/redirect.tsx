import React, { useContext, useEffect, useCallback } from 'react'
import { ActionType, Route } from './router.types'
import { RouterContext } from './router'
import { matchRoute, history } from './router.utils'

interface RedirectProps {
  path: string
  redirectTo: Route
}

const Redirect: React.SFC<RedirectProps> = ({ path, redirectTo }) => {
  const [{ prefix }, dispatch] = useContext(RouterContext)

  const redirect = useCallback(
    (pathname: string) => {
      if (matchRoute(path, pathname, prefix)) {
        dispatch({
          type: ActionType.SetActive,
          route: redirectTo,
        })
        history.push(prefix + redirectTo.path, redirectTo)
      }
    },
    [path, redirectTo],
  )

  useEffect(() => {
    const unlisten = history.listen(({ pathname }) => redirect(pathname))
    redirect(window.location.pathname)
    return () => unlisten()
  }, [])

  return null
}

export default Redirect
