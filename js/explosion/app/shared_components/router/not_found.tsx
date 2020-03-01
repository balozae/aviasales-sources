import React, { useContext, useState, useLayoutEffect } from 'react'
import { RouterContext } from './router'

const NotFound: React.SFC = (props) => {
  const [{ routes, activeRoute }] = useContext(RouterContext)

  // HACK: wait for first draw (cuz all routes must be mounted first)
  const [isMounted, setIsMounted] = useState(false)
  useLayoutEffect(() => {
    setIsMounted(true)
  }, [])

  const hasNoActiveRoute = !activeRoute || routes.every((route) => route.name !== activeRoute.name)

  if (hasNoActiveRoute && isMounted) {
    return <>{props.children}</>
  }

  return null
}

export default NotFound
