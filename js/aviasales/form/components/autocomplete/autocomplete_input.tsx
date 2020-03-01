import * as React from 'react'
import { InitialInputState } from 'form/types'
import { GetInputPropsOptions } from 'downshift'

const THROTTLE_DURATION = 100
interface Props {
  forwardedRef: React.RefObject<HTMLInputElement>
  placeholder: string
  className: string
  initialInputState?: InitialInputState
  id: string
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  value: string
  helpers: GetInputPropsOptions
}

interface State {
  inputValue: string
}

export default class AutocompleteInput extends React.Component<Props, State> {
  state: State = { inputValue: '' }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.value !== this.props.value) {
      this.setState({ inputValue: nextProps.value })
    }
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      inputValue: props.value || ((props.initialInputState && props.initialInputState.value) || ''),
    }
  }

  throttleEvent = (event) => {
    const element = event.target
    const timeStamp = event.timeStamp

    if (!element.lastEvent) {
      element.lastEvent = 1
    }

    if (timeStamp < element.lastEvent + THROTTLE_DURATION) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }

    element.lastEvent = timeStamp
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: event.target.value })
    this.props.onChange(event)
  }

  render() {
    const { forwardedRef, helpers, initialInputState, id, ...props } = this.props
    return (
      <input
        {...helpers}
        {...props}
        ref={forwardedRef}
        id={id}
        type="text"
        autoFocus={initialInputState && initialInputState.hasFocus}
        data-testid={`${id}-autocomplete-field`}
        value={this.state.inputValue}
        onChange={this.handleInputChange}
        aria-autocomplete="list"
        aria-labelledby={`${id}-label`}
        autoComplete="off"
        spellCheck={false}
        onFocusCapture={(e) => this.throttleEvent(e)}
        onBlurCapture={(e) => this.throttleEvent(e)}
      />
    )
  }
}
