import React, { memo } from 'react'
import clssnms from 'clssnms'
import { TopPlacementCampaign } from './ad_top_placement.types'
import { TicketMediaQueryTypes } from 'shared_components/ticket/ticket.types'

const cn = clssnms('ad-top-placement')

const VisaSideContent = ({
  image_path: imagePath,
  main_text: mainText,
  bottom_text: bottomText,
  isNightMode,
  mediaQueryType,
}: TopPlacementCampaign['data']['meta'] & {
  isNightMode: boolean
  mediaQueryType?: TicketMediaQueryTypes
}) => {
  if (!mainText && !bottomText) {
    return null
  }

  let image = ''
  if (imagePath) {
    image = !isNightMode
      ? `https://pics.avs.io/${imagePath}`
      : `https://pics.avs.io/${imagePath}_night`
  }
  const mode = mediaQueryType === TicketMediaQueryTypes.Mobile ? `--mobile` : ''

  return (
    <div className={cn('side-content', mode)}>
      {image && (
        <div className={cn('visa-icon')}>
          <img src={`${image}.png`} srcSet={`${image}@2x.png 2x`} />
        </div>
      )}
      {mainText && <div className={cn('side-text')}>{mainText}</div>}
      {bottomText && <div className={cn('bottom-content')}>{bottomText}</div>}
    </div>
  )
}

export default memo(VisaSideContent)
