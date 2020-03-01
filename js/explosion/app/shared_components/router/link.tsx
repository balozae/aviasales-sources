import React, { useContext, useCallback } from 'react'
import { RouterContext } from './router'
import { ActionType } from './router.types'
import { history } from './router.utils'

interface LinkProps {
  title: React.ReactNode
  name: string
  className?: string
  onClick?: () => void
}

const Link: React.FC<LinkProps> = (props) => {
  const [{ prefix, routes, activeRoute }, dispatch] = useContext(RouterContext)
  const route = routes.find(({ name }) => name === props.name)
  const path = route ? prefix + route.path : ''

  const isActive = activeRoute && activeRoute.name === props.name

  const handleLinkClick = useCallback(
    (e) => {
      e.preventDefault()
      if (isActive) {
        return
      }
      dispatch({
        type: ActionType.SetActive,
        route: route!,
      })
      history.push(path, route)
      if (props.onClick) {
        props.onClick()
      }
    },
    [path, route, isActive, props.onClick],
  )

  if (!route) {
    return null
  }

  const className = isActive ? `${props.className} --active` : props.className

  return (
    <a
      href={path}
      className={className}
      onClick={handleLinkClick}
      data-testid={`link-${props.name}`}
    >
      {props.title}
      {props.children}
    </a>
  )
}

export default Link
