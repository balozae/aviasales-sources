import React, { memo } from 'react'
import clssnms from 'clssnms'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import Tooltip from 'shared_components/tooltip'
import { getBagDescription } from '../ticket_tariffs.utils'
import BagIcon from '../../bag_icon/bag_icon'
import { Bags, TariffType, BagType, UNKNOWN } from 'shared_components/types/tariffs'

import './ticket_tariffs_bags_info.scss'

const cn = clssnms('bags-info')

export interface BagsInfoProps {
  bags: Bags
  tariffType?: TariffType
  withDebug?: boolean
  withTooltip?: boolean
}

const BagsIcons = memo(
  ({ bags, type }: { bags: Bags; type: BagType }): React.ReactElement<HTMLDivElement> => {
    const bagInfo = bags[type]
    const amountArray = bagInfo.amount === 0 ? [0] : [...Array(bagInfo.amount)]
    return (
      <div className={cn('icons', `--${type}`)}>
        {/* NOTE: render few bag icons if need to draw weight inside, and render just amount if no weight to render */}
        {bagInfo.amount > 1 && bagInfo.weight && bagInfo.weight !== UNKNOWN ? (
          amountArray.map((_, key) => (
            <BagIcon
              key={key}
              type={type}
              weight={bagInfo.weight}
              amount={bagInfo.amount}
              dimensions={bagInfo.dimensions}
            />
          ))
        ) : (
          <BagIcon
            type={type}
            weight={bagInfo.weight}
            amount={bagInfo.amount}
            dimensions={bagInfo.dimensions}
          />
        )}
      </div>
    )
  },
)

const DebugMessage = memo(
  ({ text }: { text: string }): React.ReactElement<HTMLSpanElement> => (
    <span key={text} className="debug-message --bags-tooltip">
      {text}
    </span>
  ),
)

const getTooltipContent = (
  props: BagsInfoProps,
  t: i18next.TFunction,
): Array<React.ReactElement<HTMLSpanElement> | string> => {
  let content: Array<React.ReactElement<HTMLSpanElement> | string> = []
  const baggageDescription = getBagDescription(t, BagType.Baggage, props.bags.baggage)
  const handbagsDescription = getBagDescription(t, BagType.Handbags, props.bags.handbags)

  if (baggageDescription) {
    content.push(baggageDescription)
    if (props.withDebug) {
      content = content.concat(<DebugMessage text={props.bags.baggage.debug} />)
    }
  }
  if (handbagsDescription) {
    content.push(handbagsDescription)
    if (props.withDebug) {
      content = content.concat(<DebugMessage text={props.bags.handbags.debug} />)
    }
  }
  if (props.withDebug) {
    content = content.concat(<DebugMessage text={`Тариф: ${props.tariffType}`} />)
  }
  return content
}

const BagsInfo: React.SFC<BagsInfoProps> = memo((props: BagsInfoProps) => {
  const tooltipVisibilityProps = props.withTooltip
    ? {}
    : {
        showByProps: true,
        isVisible: false,
      }
  const tooltipFn = () => <BagsTooltipContent {...props} />

  return (
    <Tooltip
      wrapperClassName={cn()}
      isInteraction={props.withDebug}
      showDelay={100}
      tooltip={tooltipFn}
      {...tooltipVisibilityProps}
    >
      <BagsIcons type={BagType.Handbags} bags={props.bags} />
      <BagsIcons type={BagType.Baggage} bags={props.bags} />
    </Tooltip>
  )
})

const BagsTooltipContent: React.SFC<BagsInfoProps> = memo((props) => {
  const { t } = useTranslation('ticket')
  return (
    <div className={cn('tooltip')}>
      {getTooltipContent(props, t).map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  )
})

export default BagsInfo
