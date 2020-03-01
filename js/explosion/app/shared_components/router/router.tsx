import React, { useReducer, createContext, useContext, useEffect, useCallback } from 'react'
import { RouterProps, RouterContextType, ActionType, Route } from './router.types'
import RouterReducer from './reducer'
import { matchRoute, history } from './router.utils'
export { default as Route } from './route'
export { default as Link } from './link'
export { default as NotFound } from './not_found'
export { default as Redirect } from './redirect'
export { history } from './router.utils'

export const RouterContext = createContext<RouterContextType>([
  {
    routes: [],
    activeRoute: null,
    prefix: '',
  },
  () => void 0,
])

const RouterComponent: React.SFC<RouterProps> = (props) => {
  const [{ routes, activeRoute, prefix }, dispatch] = useContext(RouterContext)

  const onRouteChange = useCallback(
    (route: Route | null) => {
      if (route && props.onRouteChange) {
        props.onRouteChange(route)
      }
    },
    [props.onRouteChange],
  )

  useEffect(
    () => {
      onRouteChange(activeRoute)

      const unlisten = history.listen(({ state, pathname }) => {
        const matchedRoute = routes.find((route) => {
          if (state && route.name === state.name) {
            return true
          }
          if (matchRoute(route.path, pathname, prefix)) {
            return true
          }
          return false
        })

        if (matchedRoute) {
          dispatch({
            type: ActionType.SetActive,
            route: matchedRoute,
          })
        }

        onRouteChange(matchedRoute || null)
      })

      return () => {
        unlisten()
      }
    },
    [routes],
  )

  return <>{props.children}</>
}

const Router: React.SFC<RouterProps> = (props) => {
  const reducer = useReducer(RouterReducer, {
    routes: [],
    prefix: props.prefix || '',
    activeRoute: null,
  })

  return (
    <RouterContext.Provider value={reducer}>
      <RouterComponent {...props} />
    </RouterContext.Provider>
  )
}

export default Router
