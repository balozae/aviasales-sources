import { SearchParams } from 'form/components/avia_form/avia_form.types'

export const UPDATE_ACTIVE_FORM_PARAMS = 'UPDATE_ACTIVE_FORM_PARAMS'

export interface UpdateActiveFormParams {
  type: typeof UPDATE_ACTIVE_FORM_PARAMS
  params: Partial<SearchParams>
}
