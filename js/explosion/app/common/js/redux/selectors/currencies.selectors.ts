import { AppState } from '../types/root/explosion'

export const getCurrencies = (state: AppState) => state.currencies

export const getCurrency = (state: AppState) => state.currency
