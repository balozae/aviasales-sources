import React, { useCallback, useEffect } from 'react'
import clssnms from 'clssnms'
import Button from 'shared_components/button/button'
import { ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import { useTranslation } from 'react-i18next'
import flagr from 'common/utils/flagr_client_instance'
import { withFlagr } from 'shared_components/flagr/flagr-react'
import { useDispatch, useSelector } from 'react-redux'
import { hasSameWoodySubscriptions } from 'common/js/redux/selectors/woody_subscriptions.selectors'
import { getDirectionSubscriptionsGoalData } from './direction_subscriptions.selector'
import { SAVE_DIRECTION_SUBSCRIPTION } from 'common/js/redux/types/direction_subscriptions.types'
import Tooltip from 'shared_components/tooltip/tooltip'
import { reachGoal } from 'common/js/redux/actions/metrics.actions'

import './direction_subscriptions.scss'

const IconBell = require('!!react-svg-loader!common/images/bell.svg')

const cn = clssnms('direction-subscriptions')

const DirectionSubscriptions: React.FC = () => {
  const { t } = useTranslation('direction_subscriptions')
  const dispatch = useDispatch()
  const isHasSameSubs = useSelector(hasSameWoodySubscriptions)
  const directionSubscriptionsGoalData = useSelector(getDirectionSubscriptionsGoalData)
  const isVisible = flagr.is('avs-feat-subscription')
  const tooltipText = isHasSameSubs ? t('successDescr') : t('subcribeDescr')

  useEffect(
    () => {
      if (isVisible) {
        dispatch(reachGoal('PROPHET_WIDGET_SHOWN', directionSubscriptionsGoalData))
      }
    },
    [isVisible],
  )

  const tooltipContent = useCallback(() => <div className={cn('tooltip')}>{tooltipText}</div>, [
    tooltipText,
  ])

  const subscribe = useCallback(
    () => {
      if (isHasSameSubs) {
        return
      }

      dispatch({
        type: SAVE_DIRECTION_SUBSCRIPTION,
      })
      dispatch(reachGoal('PROPHET_WIDGET_SUBSCRIBE_BUTTON_CLICK', directionSubscriptionsGoalData))
    },
    [isHasSameSubs],
  )

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn('', { '--disabled': isHasSameSubs })}>
      <Tooltip tooltip={tooltipContent} showDelay={200} position={'top'}>
        <Button
          className={cn('btn-subs')}
          size={ButtonSize.L}
          mod={isHasSameSubs ? ButtonMod.Disabled : ButtonMod.SecondaryOutline}
          onClick={subscribe}
        >
          {!isHasSameSubs && <IconBell className={cn('btn-icon')} />}
          {isHasSameSubs ? t('successBtn') : t('subcribeBtn')}
        </Button>
      </Tooltip>
    </div>
  )
}

export default withFlagr(flagr, ['avs-feat-subscription'])(DirectionSubscriptions)
