import axios from 'axios'
import { ThunkAction } from 'redux-thunk'

const CURRENCY_RATES_URL = '/currency.json'

// TODO: move to shared directory
const fetchCurrencyRates = (): ThunkAction<void, any, void, any> => async (dispatch) => {
  axios(CURRENCY_RATES_URL).then((response) => {
    const currencies: { [key: string]: number } = response ? response.data : undefined
    if (currencies && typeof currencies === 'object' && Object.keys(currencies).length) {
      dispatch({ type: 'UPDATE_CURRENCIES', currencies })
    }
  })
}

export default fetchCurrencyRates
