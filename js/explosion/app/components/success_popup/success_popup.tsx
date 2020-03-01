import React, { memo } from 'react'
import clssnms from 'clssnms'
import Modal from 'shared_components/modal/modal'
import ModalDefaultHeader from 'shared_components/modal/modal_default_header/modal_default_header'
import { Heading, Text } from 'shared_components/typography'
import { ButtonMod, ButtonSize, ButtonType } from 'shared_components/button/button.types'
import Button from 'shared_components/button/button'

import './success_popup.scss'

const cn = clssnms('success-popup')

interface SuccessPopupProps {
  visible: boolean
  onClose: () => void
  title: string
  caption: string
  buttonText: string
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  visible,
  onClose,
  title,
  caption,
  buttonText,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      fixedHeader={false}
      className={cn()}
      header={<ModalDefaultHeader onClose={onClose} className="--no-border" />}
    >
      <div className={cn('content-wrap')}>
        <div className={cn('content')}>
          <Heading size={3} tag="div" className={cn('title')}>
            {title}
          </Heading>
          <Text tag="p" modifier="small" className={cn('caption')}>
            {caption}
          </Text>
          <Button
            mod={ButtonMod.SecondaryOutline}
            size={ButtonSize.M}
            type={ButtonType.Submit}
            className={cn('button')}
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default memo(SuccessPopup)
