import { ReactNode, Dispatch } from 'react'

export interface RouterProps {
  children: ReactNode
  prefix?: string
  onRouteChange?: (name: Route | null) => void
}

export interface Route {
  name: string
  path: string
}

export interface RouteProps {
  route: Route
  children: ReactNode
}

export interface RouterContextState {
  routes: Route[]
  activeRoute: Route | null
  prefix: string
}

export enum ActionType {
  AddRoute = 'addRoute',
  RemoveRoute = 'removeRoute',
  SetActive = 'setActive',
}

export interface RouteAction {
  route: Route | null
  type: ActionType
}

export type RouterContextType = [RouterContextState, Dispatch<RouteAction>]
