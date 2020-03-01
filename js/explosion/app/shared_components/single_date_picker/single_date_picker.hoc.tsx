import React from 'react'
import { parse } from 'finity-js'
import { ISingleDatePickerProps } from './single_date_picker'
import { formatDateToString } from 'shared_components/utils/datetime'

interface State {
  inputValue: string
  isInputActive: boolean
}

interface OwnProps {
  onInputInteration?: (isInputActive?: boolean) => void
  pattern?: string
}

type Props = ISingleDatePickerProps & OwnProps

export default function withHandlingSelectedDate(Component: typeof React.Component) {
  return class UncontrolledDatePicker extends React.PureComponent<Props, State> {
    state = {
      inputValue: formatDateToString(this.props.value, 'D MMMM, ddd'),
      isInputActive: this.props.isInputActive || false,
    }

    private lastSelectedDate?: Date

    componentDidUpdate(prevProps: Props, prevState: State) {
      if (
        this.props.isInputActive !== undefined &&
        this.props.isInputActive !== prevProps.isInputActive &&
        this.props.isInputActive !== this.state.isInputActive
      ) {
        this.setState({ isInputActive: this.props.isInputActive })
      }

      if (
        this.props.value !== prevProps.value ||
        prevState.isInputActive !== this.state.isInputActive
      ) {
        this.setState({ inputValue: this.getInputValue(this.props.value) })
      }
    }

    handleInputActiveState = (isInputActive: boolean) => {
      let date = this.lastSelectedDate || this.props.value

      this.setState(
        {
          isInputActive: isInputActive,
          inputValue: this.getInputValue(date),
        },
        () => {
          delete this.lastSelectedDate
        },
      )
    }

    handleSelectDate = (date: Date) => {
      if (this.props.onSelect) {
        this.props.onSelect(date)
        this.lastSelectedDate = date
        this.setState({ inputValue: this.getInputValue(date) })
      }
    }

    handleChange = (e) => {
      const { value } = e.target

      try {
        const date = parse(value, this.props.pattern!)

        if (date) {
          this.handleSelectDate(date)
        }
      } catch (e) {
        this.setState({ inputValue: value })
      }

      if (this.props.onChange) {
        this.props.onChange(e)
      }
    }

    handleClose = () => {
      this.setState({
        isInputActive: false,
      })

      if (this.props.onClose) {
        this.props.onClose()
      }
    }

    handleInputClick = () => {
      this.setState({ isInputActive: !this.state.isInputActive })

      if (this.props.onInputInteration) {
        this.props.onInputInteration(!this.state.isInputActive)
      }
    }

    getInputValue(date?: Date) {
      if (!date) {
        return ''
      }

      const pattern = this.state.isInputActive ? 'DD.MM.YYYY' : 'D MMMM, ddd'
      return formatDateToString(date as Date, pattern)
    }

    render() {
      return (
        <Component
          {...this.props}
          onSelect={this.handleSelectDate}
          onChange={this.handleChange}
          inputValue={this.state.inputValue}
          isInputActive={this.state.isInputActive}
          onClose={this.handleClose}
          onInputClick={this.handleInputClick}
          onChangeStateOfInputActivity={this.handleInputActiveState}
        />
      )
    }
  }
}
