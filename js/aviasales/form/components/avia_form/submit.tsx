import * as React from 'react'
import clssnms from 'clssnms'
import Tooltip from 'components/tooltip'
import { useTranslation } from 'react-i18next'

const classNames = clssnms('of_main_form')

interface Props {
  subClassName: string
  disabled: boolean
  onHintCloseClick: Function
  showHint: boolean
}

const Button = ({ disabled }: Props): JSX.Element => {
  const { t } = useTranslation('avia_form')
  return (
    <button type="submit" className={classNames('submit')} disabled={disabled}>
      <span className={classNames('submit-text')}>{t('avia_form:submitButtonText')}</span>
    </button>
  )
}

const TooltipContent = ({ onHintCloseClick }: Props) => {
  const { t } = useTranslation('avia_form')
  const onClick = React.useCallback(
    (e) => {
      onHintCloseClick(e)
    },
    [onHintCloseClick],
  )

  return (
    <div className={classNames('hint_tooltip')}>
      {t('avia_form:submitButtonTooltip')}
      <div className={classNames('hint_dismiss')} onClick={onClick} />
    </div>
  )
}

export default (props: Props) => {
  if (props.subClassName === '--common-search') {
    return (
      <Tooltip
        wrapperClassName={classNames('submit-wrap', props.subClassName)}
        tooltip={TooltipContent}
        tooltipProps={{ onHintCloseClick: props.onHintCloseClick }}
        showByProps={true}
        isVisible={props.showHint}
        tooltipClass={classNames('tooltip_container')}
        isInteraction={true}
        position="bottom"
      >
        <Button {...props} />
      </Tooltip>
    )
  }
  return (
    <div className={classNames('submit-wrap', props.subClassName)}>
      <Button {...props} />
    </div>
  )
}
