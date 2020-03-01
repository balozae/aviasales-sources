import Guestia from 'guestia_client'
import Cookie from 'oatmeal-cookie'
import cookieDomain from 'utils/cookie_domain.coffee'
import { Schema } from 'guestia_client/lib/types'

const HOST = 'https://auth.avs.io'

export interface GuestiaSettings {
  [key: string]: string
}

const SCHEMA: Schema = {
  email: {
    domain: cookieDomain,
    expires: Infinity,
  },
  currency: {
    domain: cookieDomain,
    expires: Infinity,
    defaultValue: 'rub',
  },
  know_english: {
    domain: cookieDomain,
    expires: Infinity,
  },
  pageview_promos: {
    domain: cookieDomain,
    expires: Infinity,
  },
  pageview_partners: {
    domain: cookieDomain,
    expires: Infinity,
  },
  user_marker: {
    domain: cookieDomain,
    expires: Infinity,
  },
  passengers: {
    storageProvider: 'localStorage',
  },
  contact_info: {
    storageProvider: 'localStorage',
  },
  prevent_geoip: {
    domain: cookieDomain,
    expires: Infinity,
  },
  sysState: {
    storageProvider: 'localStorage',
  },
  searchHistory: {
    storageProvider: 'localStorage',
  },
  geoip: {
    storageProvider: 'localStorage',
  },
}

const guestia = new Guestia({
  host: HOST,
  authHost: HOST,
  uid: Cookie.get('auid'),
  schema: SCHEMA,
})

export default guestia
