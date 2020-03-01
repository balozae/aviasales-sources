import React, { useContext, useEffect } from 'react'
import { RouteProps, ActionType } from './router.types'
import { RouterContext } from './router'
import { matchRoute } from './router.utils'

const Route: React.SFC<RouteProps> = (props) => {
  const [{ prefix, activeRoute }, dispatch] = useContext(RouterContext)
  useEffect(() => {
    dispatch({
      type: ActionType.AddRoute,
      route: props.route,
    })
    const isActiveByDefault = matchRoute(props.route.path, window.location.pathname, prefix)
    if (isActiveByDefault) {
      dispatch({
        type: ActionType.SetActive,
        route: props.route,
      })
    }
    return () => {
      dispatch({
        type: ActionType.RemoveRoute,
        route: props.route,
      })
    }
  }, [])

  const isActive = activeRoute && activeRoute.name === props.route.name
  if (isActive) {
    return <>{props.children}</>
  }
  return null
}

export default Route
