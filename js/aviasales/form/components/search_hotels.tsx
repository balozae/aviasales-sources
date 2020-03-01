import * as React from 'react'
import Cookie from 'common/bindings/cookie'
import { SEARCH_HOTELS_COOKIE } from 'form/components/avia_form/avia_form.constants'
import { useTranslation } from 'react-i18next'

// TODO: import
const Checkbox = require('./checkbox')

interface Props {
  onChange: Function
  checked: boolean
}

const handleChange = (onChange: Function) => (value: number) => {
  const shouldSearchHotels = !!value
  if (shouldSearchHotels) {
    Cookie.expire(SEARCH_HOTELS_COOKIE, { path: '/' })
  } else {
    Cookie.set(SEARCH_HOTELS_COOKIE, true, { path: '/', expires: 60 * 60 * 24 * 7 })
  }
  onChange(shouldSearchHotels)
}

function SearchHotels(props: Props): JSX.Element | null {
  const { t } = useTranslation('common')
  return (
    <div className="of_clicktripz">
      <Checkbox
        text={t('common:openHotelsBooking')}
        className="of_input_checkbox"
        checked={props.checked ? 1 : 0}
        name="clicktripz"
        id="clicktripz"
        onChange={handleChange(props.onChange)}
      />
    </div>
  )
}

export default SearchHotels
