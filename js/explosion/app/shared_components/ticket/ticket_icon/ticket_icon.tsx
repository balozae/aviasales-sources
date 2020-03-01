import React from 'react'
import clssnms from 'clssnms'
import { IconTypes, IconSizes, IconColors } from './ticket_icon.types'
const IconAirplane = require('!!react-svg-loader!./images/airplane.svg')
const IconBoat = require('!!react-svg-loader!./images/boat.svg')
const IconBus = require('!!react-svg-loader!./images/bus.svg')
const IconChair = require('!!react-svg-loader!./images/chair.svg')
const IconChange = require('!!react-svg-loader!./images/change.svg')
const IconMoon = require('!!react-svg-loader!./images/moon.svg')
const IconRunningMen = require('!!react-svg-loader!./images/running_men.svg')
const IconTaxi = require('!!react-svg-loader!./images/taxi.svg')
const IconTime = require('!!react-svg-loader!./images/time.svg')
const IconTrain = require('!!react-svg-loader!./images/train.svg')
const IconVisa = require('!!react-svg-loader!./images/visa.svg')
const RecheckBaggage = require('!!react-svg-loader!./images/recheck_baggage.svg')
const DifferentAirport = require('!!react-svg-loader!./images/different_airport.svg')

import './ticket_icon.scss'

const cn = clssnms('ticket-icon')

const iconComponentMap = {
  [IconTypes.Airplane]: IconAirplane,
  [IconTypes.Boat]: IconBoat,
  [IconTypes.Bus]: IconBus,
  [IconTypes.Chair]: IconChair,
  [IconTypes.Change]: IconChange,
  [IconTypes.Moon]: IconMoon,
  [IconTypes.RunningMen]: IconRunningMen,
  [IconTypes.Taxi]: IconTaxi,
  [IconTypes.Time]: IconTime,
  [IconTypes.Train]: IconTrain,
  [IconTypes.Visa]: IconVisa,
  [IconTypes.RecheckBaggage]: RecheckBaggage,
  [IconTypes.DifferentAirport]: DifferentAirport,
}

export interface TicketIconProps {
  type: IconTypes
  size?: IconSizes
  color?: IconColors
  className?: string
}

const TicketIcon: React.FunctionComponent<TicketIconProps> = ({
  type,
  size = IconSizes.M,
  color = IconColors.Grey,
  className,
}: TicketIconProps) => {
  const IconComponent = iconComponentMap[type]
  return <IconComponent className={cn(null, [className!, `--color-${color}`, `--size-${size}`])} />
}

export default React.memo(TicketIcon)
