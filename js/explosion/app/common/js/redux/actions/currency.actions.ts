import { CurrencyState, CurrencyActions, UPDATE_CURRENCY } from '../types/currency.types'
import { ThunkAction } from 'redux-thunk'
import { AppState } from '../types/root/explosion'
import { setUserSetting } from 'user_account/actions/user_settings.actions'

export const updateCurrency = (
  currency: CurrencyState,
): ThunkAction<any, AppState, any, CurrencyActions> => (dispatch) => {
  dispatch({ type: UPDATE_CURRENCY, currency })
  dispatch(setUserSetting('currency', currency.toLowerCase()))
}
