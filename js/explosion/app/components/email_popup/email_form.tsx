import React, { useRef, useCallback, useLayoutEffect } from 'react'
import clssnms from 'clssnms'
import StyledInput from 'shared_components/styled_input/styled_input'
import Button from 'shared_components/button/button'
import { ButtonType, ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import { Heading, Text } from 'shared_components/typography'

import './email_form.scss'

const cn = clssnms('email-form')

export interface EmailFormProps {
  title: string
  submitButtonText: string
  onSubmit: (email: string) => void

  defaultEmail?: string
  placeholder?: string
  isDisabled?: boolean
  bottomText?: React.ReactNode
}

const EmailForm: React.FC<EmailFormProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      props.onSubmit(inputRef.current!.value)
    },
    [props.onSubmit, inputRef.current],
  )

  return (
    <div className={cn()}>
      <form className={cn('form')} onSubmit={handleSubmit}>
        <Heading size={3} tag="div" className={cn('title')}>
          {props.title}
        </Heading>
        <StyledInput
          type="email"
          name="email"
          defaultValue={props.defaultEmail}
          required={true}
          placeholder={props.placeholder}
          className={cn('input')}
          forwardedRef={inputRef}
        />
        <Button
          mod={ButtonMod.Secondary}
          size={ButtonSize.M}
          type={ButtonType.Submit}
          className={cn('button')}
          disabled={props.isDisabled}
        >
          {props.submitButtonText}
        </Button>
        {props.bottomText && (
          <Text tag="p" modifier="xsmall" className={cn('bottom-text')}>
            {props.bottomText}
          </Text>
        )}
      </form>
    </div>
  )
}

export default EmailForm
