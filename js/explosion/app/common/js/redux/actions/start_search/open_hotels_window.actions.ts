import { AnyAction } from 'redux'
import i18next from 'i18next'
import { ThunkAction } from 'redux-thunk'
import rollbar from 'common/utils/rollbar'
import { SearchParams } from 'form/components/avia_form/avia_form.types'
import after from 'common/utils/after'
import { createBookingUrlFromSearchParams } from 'shared_components/hotels_utils/booking'
import Goalkeeper from 'common/bindings/goalkeeper'
import { AppState } from '../../types/root/explosion'

const REDIRECT_TO_HOTELS_DELAY = 1000

export const openHotelsWindow = (
  params: SearchParams,
): ThunkAction<any, AppState, any, AnyAction> => (dispatch, getState) => {
  const state = getState()
  const locale = i18next.language

  let utmMedium = ''
  switch (state.currentPage) {
    case 'main':
      utmMedium = 'homepage'
      break
    case 'search':
      utmMedium = 'search'
      break
    default:
    case 'content':
      utmMedium = 'content'
      break
  }

  after(REDIRECT_TO_HOTELS_DELAY, () => {
    try {
      window.location.assign(
        createBookingUrlFromSearchParams(
          params,
          {
            currency: state.currency || 'rub',
            utm: 'avs_form_prod',
            utmCampaign: 'checkbox',
            utmSource: 'aviasales',
            utmMedium,
            fallbackLabel: 'avs_feedback_button',
            language: locale,
          },
          {},
          'https://web.hotels.aviasales.ru/hotels',
        ),
      )
      // TODO: reachGoal
      Goalkeeper.triggerEvent('avia_form', 'searchHotels', 'openPopup')
    } catch (error) {
      rollbar.warn("Can't open hotels search")
    }
  })
}
