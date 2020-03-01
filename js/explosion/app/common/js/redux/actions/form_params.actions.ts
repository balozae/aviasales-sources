import { SearchParams } from 'form/components/avia_form/avia_form.types'
import { UpdateActiveFormParams, UPDATE_ACTIVE_FORM_PARAMS } from '../types/form_params.types'

export const updateActiveFormParams = (params: Partial<SearchParams>): UpdateActiveFormParams => ({
  type: UPDATE_ACTIVE_FORM_PARAMS,
  params,
})
