import { stringify } from 'query-string'

export const personalAccountUtm = (page: string, content: string) =>
  stringify({
    utm_source: 'aviasales',
    utm_meduim: 'personal_account',
    utm_campaign: page,
    utm_content: content,
  })

const allAvailableUserAccountRoutes = {
  history: {
    name: 'history',
    path: '/history',
  },
  subscriptions: {
    name: 'subscriptions',
    path: '/favorites',
  },
  documents: {
    name: 'documents',
    path: '/documents',
  },
  promos: {
    name: 'promos',
    path: '/promos',
  },
  woody_subscriptions: {
    name: 'direction_subscriptions',
    path: '/subscriptions',
  },
  settings: {
    name: 'settings',
    path: '/settings',
  },
}

export const defaultUserAccountRoutesArray = ['history', 'subscriptions', 'documents', 'settings']

export type UserAccountRoute = {
  name: string
  path: string
}

export const getUserAccountRoutes = (routesToShow: string[]): UserAccountRoute[] => {
  return routesToShow.map((routeId) => allAvailableUserAccountRoutes[routeId])
}
