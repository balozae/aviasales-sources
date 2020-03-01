import React from 'react'
import Rollbar from 'common/utils/rollbar'
import { ErrorType } from './error_boundary.types'

export interface ErrorBoundaryProps {
  children: JSX.Element
  replaceTo?: any[] | JSX.Element
  errorType?: ErrorType
  errorText?: string
}

interface ErrorBoundaryState {
  error: string | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    replaceTo: null,
    errorType: ErrorType.Error,
    errorText: '',
  }

  state: ErrorBoundaryState = {
    error: null,
  }

  componentDidCatch(error: Error | null, errorInfo: React.ErrorInfo | null) {
    const { errorType, errorText } = this.props
    const text = errorText ? `${errorText} ` : ''
    const msg = text + error
    this.setState({ error: msg })
    Rollbar[errorType!](msg, errorInfo)
  }

  render() {
    if (this.state.error) {
      return this.props.replaceTo || null
    }
    return this.props.children
  }
}

export default ErrorBoundary
