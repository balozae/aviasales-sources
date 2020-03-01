import React from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from 'shared_components/error_boundary/error_boundary'
import TooltipComponent from './tooltip'

const Tooltip = (props) => (
  <ErrorBoundary replaceTo={<div className={props.wrapperClassName}>{props.children}</div>}>
    <TooltipComponent {...props} />
  </ErrorBoundary>
)

Tooltip.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element]),
  wrapperClassName: PropTypes.string,
}

Tooltip.defaultProps = {
  children: null,
  wrapperClassName: '',
}

export default Tooltip
