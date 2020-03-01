React = require('react')
{div} = require('react-dom-factories')
PropTypes = require('prop-types')
{format} = require('finity-js')
{dateToLowerCase} = require('shared_components/l10n/l10n')

Dates = ({departDate, returnDate, t}) ->
  dateFormat = if returnDate then 'DD MMM' else 'DD MMM, ddd'
  locale = t('common:dateTime', {returnObjects: true})
  div
    className: 'calendar-matrix-dates'
    dateToLowerCase(format(departDate, dateFormat, true, locale))
    if returnDate
      " — #{dateToLowerCase(format(returnDate, 'DD MMM', true, locale))}"
    else
      ''

Dates.propTypes =
  t: PropTypes.func.isRequired
  departDate: PropTypes.instanceOf(Date).isRequired
  returnDate: PropTypes.instanceOf(Date)

export default Dates
