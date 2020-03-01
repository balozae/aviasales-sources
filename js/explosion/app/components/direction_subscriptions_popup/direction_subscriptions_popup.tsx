import React, { useCallback } from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE,
  DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED,
} from 'common/js/redux/types/direction_subscriptions.types'
import Modal from 'shared_components/modal/modal'
import ModalDefaultHeader from 'shared_components/modal/modal_default_header/modal_default_header'
import { Heading, Text } from 'shared_components/typography'
import { ButtonMod, ButtonSize } from 'shared_components/button/button.types'
import Button from 'shared_components/button/button'

import './direction_subscriptions_popup.scss'
import { getPopupDataByType } from 'common/js/redux/selectors/popups.selectors'
import { PopupType } from 'common/js/redux/types/popups.types'
import { AppState } from 'common/js/redux/types/root/explosion'

const cn = clssnms('direction-subscriptions-popup')

const DirectionSubscriptionsPopup: React.FC<{}> = () => {
  const { t } = useTranslation('direction_subscriptions')
  const dispatch = useDispatch()
  const isVisible = useSelector(
    (state: AppState) => !!getPopupDataByType(state, PopupType.DirectionSubscriptions),
  )

  const handleClose = useCallback(() => {
    dispatch({
      type: DIRECTION_SUBSCRIPTIONS_POPUP_CLOSE,
    })
  }, [])

  const handleProceed = useCallback(() => {
    dispatch({
      type: DIRECTION_SUBSCRIPTIONS_POPUP_PROCEED,
    })
  }, [])

  return (
    <Modal
      visible={isVisible}
      onClose={handleClose}
      fixedHeader={false}
      className={cn()}
      header={<ModalDefaultHeader onClose={handleClose} className="--no-border" />}
    >
      <div className={cn('content-wrap')}>
        <div className={cn('content')}>
          <Heading size={3} tag="div" className={cn('title')}>
            {t('popup.title')}
          </Heading>
          <Text tag="p" modifier="small" className={cn('caption')}>
            {t('popup.description')}
          </Text>
          <Button
            mod={ButtonMod.SecondaryOutline}
            size={ButtonSize.M}
            className={cn('button')}
            onClick={handleProceed}
          >
            {t('subcribeBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DirectionSubscriptionsPopup
