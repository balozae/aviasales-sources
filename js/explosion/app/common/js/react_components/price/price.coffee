React = require('react')
PropTypes = require('prop-types')
{connect} = require('react-redux')
{PriceWithLogic} = require('shared_components/price/price_with_logic')

mapStateToProps = (state) ->
  {
    currency: state.currency,
    currencies: state.currencies
  }

module.exports = connect(mapStateToProps)(PriceWithLogic)
