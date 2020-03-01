import { RouterContextState, ActionType } from './router.types'

const RouterReducer = (state, action): RouterContextState => {
  switch (action.type) {
    case ActionType.AddRoute:
      return { ...state, routes: [...state.routes, action.route] }

    case ActionType.RemoveRoute:
      return { ...state, routes: state.routes.filter((route) => route.name !== action.name) }

    case ActionType.SetActive:
      return { ...state, activeRoute: action.route }

    default:
      return state
  }
}

export default RouterReducer
