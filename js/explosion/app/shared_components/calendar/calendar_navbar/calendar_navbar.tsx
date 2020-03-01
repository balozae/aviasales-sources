import React, { useState, useCallback, useMemo } from 'react'
import clssnms from 'clssnms'
import { isEqualMonths, addMonths } from 'finity-js'
import { useTranslation } from 'react-i18next'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import Tooltip from 'shared_components/tooltip'
import IconArrow from '!!react-svg-loader!./images/icon-arrow.svg'
import IconArrowLong from '!!react-svg-loader!./images/icon-arrow-long.svg'

import './calendar_navbar.scss'
import './calendar_navbar_b.scss'

export interface CalendarNavbarProps {
  previousMonth: Date
  nextMonth: Date
  onPreviousClick: () => void
  onNextClick: () => void
  fromMonth?: Date
  toMonth?: Date
}

const CalendarNavbar: React.FC<CalendarNavbarProps> = ({
  previousMonth,
  nextMonth,
  onPreviousClick,
  onNextClick,
  fromMonth,
  toMonth,
}) => {
  const isArrowsExperiment = flagr.is('avs-exp-calendarNavArrows')
  const cn = useMemo(() => clssnms(isArrowsExperiment ? 'calendar-navbar-b' : 'calendar-navbar'), [
    isArrowsExperiment,
  ])

  const [isMouseOnNextBtn, setIsMouseOnNextBtn] = useState(false)

  const { t } = useTranslation('calendar')

  const prevDisabled = fromMonth ? isEqualMonths(fromMonth, addMonths(previousMonth, 1)) : false
  const nextDisabled = toMonth ? isEqualMonths(toMonth, addMonths(nextMonth, -1)) : false

  const handlePreviousClick = React.useCallback(
    () => {
      if (prevDisabled) {
        return
      }

      onPreviousClick()
    },
    [onPreviousClick, prevDisabled],
  )

  const handleNextClick = React.useCallback(
    () => {
      if (nextDisabled) {
        return
      }
      onNextClick()
    },
    [onPreviousClick, nextDisabled],
  )

  const handleMouseEnterNextBtn = () => {
    setIsMouseOnNextBtn(true)
  }

  const handleMouseLeaveOnNextBtn = () => {
    setIsMouseOnNextBtn(false)
  }

  const tooltipContent = () => (
    <div className={cn('return-btn-tooltip')}>{t('calendar:nextBtnTooltipText')}</div>
  )

  return (
    <div className={cn()}>
      <button
        type="button"
        className={cn('button', {
          '--disabled': prevDisabled,
          '--prev': true,
        })}
        onClick={handlePreviousClick}
      >
        {isArrowsExperiment ? (
          <IconArrowLong className={cn('icon', '--prev')} />
        ) : (
          <IconArrow className={cn('icon', '--prev')} />
        )}
      </button>
      <Tooltip
        tooltip={tooltipContent}
        showDelay={100}
        wrapperClassName={cn('tooltip-wrapper')}
        position="left"
        showByProps={true}
        isVisible={nextDisabled && isMouseOnNextBtn}
      >
        <button
          type="button"
          className={cn('button', { '--disabled': nextDisabled, '--next': true })}
          onClick={handleNextClick}
          onMouseEnter={handleMouseEnterNextBtn}
          onMouseLeave={handleMouseLeaveOnNextBtn}
        >
          {isArrowsExperiment ? (
            <IconArrowLong className={cn('icon', '--next')} />
          ) : (
            <IconArrow className={cn('icon', '--next')} />
          )}
        </button>
      </Tooltip>
    </div>
  )
}

export default withFlagr(flagr, ['avs-exp-calendarNavArrows'])(CalendarNavbar)
