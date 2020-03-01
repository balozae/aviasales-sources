import React, { useCallback, memo } from 'react'
import clssnms from 'clssnms'
import Modal from 'shared_components/modal/modal'
import Heading from 'shared_components/typography/heading/heading'
import Text from 'shared_components/typography/text/text'
import Button from 'shared_components/button/button'
import { ButtonMod, ButtonSize } from 'shared_components/button/button.types'

import './rentalcars_popup.scss'

const RENTALCARS_IMAGES = [
  {
    name: 'first',
    src: require('./images/1.png'),
  },
  {
    name: 'second',
    src: require('./images/2.png'),
  },
  {
    name: 'third',
    src: require('./images/3.png'),
  },
]

const cn = clssnms('rentalcars-popup')

export interface RentalcarsPopupProps {
  isVisible: boolean
  onClose: () => void
  onButtonCLick: () => void
  title: string
  caption: string
  buttonText: string
  buttonLink: string
}

const RentalcarsPopup: React.FC<RentalcarsPopupProps> = (props) => {
  const { isVisible, onClose, title, caption, buttonText, buttonLink, onButtonCLick } = props

  const handleClose = useCallback(() => onClose(), [onClose])
  const handleButtonClick = useCallback(() => onButtonCLick(), [onButtonCLick])

  return (
    <Modal
      fixedHeader={false}
      fixedFooter={false}
      animationType="fade"
      visible={isVisible}
      className="--rentalcars-popup"
    >
      <div className={cn()}>
        <div className={cn('oval')} />
        <div className={cn('inner')}>
          <div className={cn('slides-wrap')}>
            <div className={cn('sequence')}>
              {RENTALCARS_IMAGES.map(({ name, src }) => (
                <div key={name} className={cn('slide', `--${name}`)}>
                  <img src={src} className={cn('slide-img')} />
                </div>
              ))}
            </div>
          </div>
          <div className={cn('content')}>
            <Heading size={3} font="rubik" className={cn('title')}>
              {title}
            </Heading>
            <Text className={cn('caption')}>{caption}</Text>
            <Button
              mod={ButtonMod.Primary}
              size={ButtonSize.L}
              className={cn('button')}
              href={buttonLink}
              onClick={handleButtonClick}
              target="_blank"
            >
              {buttonText}
            </Button>
          </div>
        </div>
        <button className={cn('close')} onClick={handleClose} />
      </div>
    </Modal>
  )
}

export default memo(RentalcarsPopup)
