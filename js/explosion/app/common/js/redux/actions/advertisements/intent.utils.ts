import { CurrentPageState } from '../../types/current_page.types'
import { TripClass } from 'common/types'
import { getTripClassNameFromCode } from 'common/utils/trip_class_helper'

export const IntentMediaThemes: any[] = [
  {
    search_compare_ads: {
      intercard: {
        background_color: '#2196f3',
        border_color: 'transparent',
        border_radius: '5px',
        text_color: '#fff',
        text_accent_color: '#ffa353',
        cell_border_color: '#edf5f7',
        primary_button_color: '#ff6d00',
        primary_button_border_color: '#ff6d00',
        primary_button_hover_color: '#ffa353',
      },
      rail: {
        background_color: '#2196f3',
        border_color: 'transparent',
        border_radius: '5px',
        text_color: '#fff',
        text_accent_color: '#ffa353',
        cell_border_color: '#edf5f7',
        primary_button_color: '#ff6d00',
        primary_button_border_color: '#ff6d00',
        primary_button_hover_color: '#ffa353',
      },
    },
  },
  {
    search_compare_ads: {
      intercard: {
        background_color: '#1e3c52',
        border_color: 'transparent',
        border_radius: '5px',
        text_color: '#fff',
        text_accent_color: '#ffa353',
        cell_border_color: '#edf5f7',
        cell_border_selected_color: '#2196f3',
        cell_border_hover_color: '#2196f3',
        primary_button_color: '#ff6d00',
        primary_button_border_color: '#ff6d00',
        primary_button_hover_color: '#ffa353',
      },
      rail: {
        background_color: '#1e3c52',
        border_color: 'transparent',
        border_radius: '5px',
        text_color: '#fff',
        text_accent_color: '#ffa353',
        cell_border_color: '#edf5f7',
        cell_border_selected_color: '#2196f3',
        cell_border_hover_color: '#2196f3',
        primary_button_color: '#ff6d00',
        primary_button_border_color: '#ff6d00',
        primary_button_hover_color: '#ffa353',
      },
    },
  },
]

export const getSiteName = () => {
  let siteName = location.hostname
    .replace('www.', '')
    .replace(/\./g, '_')
    .toUpperCase()

  if (siteName.indexOf('JETRADAR') !== -1) {
    siteName = 'JETRADAR'
  }

  return siteName
}

export const getSiteCountry = () => {
  const HTML = document.documentElement!
  return HTML.getAttribute('data-host') || 'RU'
}

export const getIntentPageId = (currentPage: CurrentPageState) => {
  const defaultPageId = 'flight.frontdoor'
  return (
    {
      main: 'flight.home',
      search: 'flight.list',
      content: defaultPageId,
    }[currentPage] || defaultPageId
  )
}

export const TripClassCodesMapForIntent = {
  [TripClass.Economy]: 'EconomyClass',
  [TripClass.PremiumEconomy]: 'PremiumClass',
  [TripClass.Business]: 'BusinessClass',
  [TripClass.FirstClass]: 'FirstClass',
}

export const getIntentTripClass = (value: string | number = 'Y') =>
  getTripClassNameFromCode(value, TripClassCodesMapForIntent)
