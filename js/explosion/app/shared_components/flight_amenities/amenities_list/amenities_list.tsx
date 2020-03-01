import * as React from 'react'
import clssnms from 'clssnms'
import { useTranslation } from 'react-i18next'
import {
  Amenities,
  AmenitiesCost,
  PowerType,
  Amenity,
  FoodType,
  EntertainmentType,
  Dirty,
} from '../flight_amenities.types'
import { AmenityTypes } from './amenities_list.types'
import IconWifi from '!!react-svg-loader!./images/wifi.svg'
import IconFood from '!!react-svg-loader!./images/food.svg'
import IconEntertainment from '!!react-svg-loader!./images/entertainment.svg'
import IconPower from '!!react-svg-loader!./images/power.svg'
import IconNonAlcoholic from '!!react-svg-loader!./images/nonalcoholic.svg'
import IconAlcoholic from '!!react-svg-loader!./images/alcoholic.svg'

const iconMap: { [key in AmenityTypes]: any } = {
  [AmenityTypes.Wifi]: IconWifi,
  [AmenityTypes.Food]: IconFood,
  [AmenityTypes.Entertainment]: IconEntertainment,
  [AmenityTypes.Power]: IconPower,
  [AmenityTypes.NonAlcoholic]: IconNonAlcoholic,
  [AmenityTypes.Alcoholic]: IconAlcoholic,
}

import './amenities_list.scss'

const cn = clssnms('amenities-list')

interface Props {
  amenities: Amenities
}

interface AmenityProps {
  title: string
  label: string
  icon: AmenityTypes
  cost?: AmenitiesCost
}

function AmenityComponent(props: AmenityProps): React.ReactElement<AmenityProps> {
  const Icon = iconMap[props.icon]

  return (
    <div className={cn('item')}>
      <Icon className={cn('icon', [props.cost ? `--${props.cost}` : ''])} />
      <span className={cn('title')}>{props.title}</span>
      <span className={cn('label')}>{props.label}</span>
    </div>
  )
}

export default function(props: Props): React.ReactElement<Props> {
  const { t } = useTranslation('amenities')

  let wifiLabel: string = 'unknown'
  let foodLabel: string = 'unknown'
  let entertainmentLabel: string = 'unknown'
  let powerLabel: string = 'unknown'
  let nonAlcoholicLabel: string = 'unknown'
  let alcoholicLabel: string = 'unknown'

  let wifiTitle: string = 'wifi'
  let foodTitle: string = 'food'
  let entertainmentTitle: string = 'multimedia'
  let powerTitle: string = 'powerTypeAdapterUsb'
  let nonAlcoholicTitle: string = 'nonalcoholic'
  let alcoholicTitle: string = 'alcoholic'

  let wifiCost: Dirty<AmenitiesCost>
  let foodCost: Dirty<AmenitiesCost>
  let entertainmentCost: Dirty<AmenitiesCost>
  let powerCost: Dirty<AmenitiesCost>
  let alcoholicCost: Dirty<AmenitiesCost>
  let nonAlcoholicCost: Dirty<AmenitiesCost>

  if (props && props.amenities) {
    wifiLabel = getCost(props.amenities.wifi)
    foodLabel = getCost(props.amenities.food)
    entertainmentLabel = getCost(props.amenities.entertainment)
    powerLabel = getCost(props.amenities.power)
    nonAlcoholicLabel = getCost(props.amenities.nonAlcoholic)
    alcoholicLabel = getCost(props.amenities.alcoholic)

    foodTitle = getTitle(props.amenities.food, foodTitle)
    entertainmentTitle = getTitle(props.amenities.entertainment, entertainmentTitle)
    powerTitle = getTitle(props.amenities.power, powerTitle)

    wifiCost = props.amenities.wifi && props.amenities.wifi.cost
    foodCost = props.amenities.food && props.amenities.food.cost
    entertainmentCost = props.amenities.entertainment && props.amenities.entertainment.cost
    powerCost = props.amenities.power && props.amenities.power.cost
    nonAlcoholicCost = props.amenities.nonAlcoholic && props.amenities.nonAlcoholic.cost
    alcoholicCost = props.amenities.alcoholic && props.amenities.alcoholic.cost
  }

  return (
    <div className={cn()}>
      <AmenityComponent
        title={t(`amenities:${foodTitle}`)}
        label={t(`amenities:${foodLabel}`)}
        icon={AmenityTypes.Food}
        cost={foodCost}
      />
      <AmenityComponent
        title={t(`amenities:${entertainmentTitle}`)}
        label={t(`amenities:${entertainmentLabel}`)}
        icon={AmenityTypes.Entertainment}
        cost={entertainmentCost}
      />
      <AmenityComponent
        title={t(`amenities:${powerTitle}`)}
        label={t(`amenities:${powerLabel}`)}
        icon={AmenityTypes.Power}
        cost={powerCost}
      />
      <AmenityComponent
        title={t(`amenities:${wifiTitle}`)}
        label={t(`amenities:${wifiLabel}`)}
        icon={AmenityTypes.Wifi}
        cost={wifiCost}
      />
      <AmenityComponent
        title={t(`amenities:${nonAlcoholicTitle}`)}
        label={t(`amenities:${nonAlcoholicLabel}`)}
        icon={AmenityTypes.NonAlcoholic}
        cost={nonAlcoholicCost}
      />
      <AmenityComponent
        title={t(`amenities:${alcoholicTitle}`)}
        label={t(`amenities:${alcoholicLabel}`)}
        icon={AmenityTypes.Alcoholic}
        cost={alcoholicCost}
      />
    </div>
  )
}

function getTitle(amenity: Amenity, def: string): string {
  if (amenity) {
    switch (amenity.type) {
      case PowerType.Adapter:
        return 'adapter'
      case PowerType.Usb:
        return 'usb'
      case FoodType.Meal:
        return 'foodTypeMeal'
      case EntertainmentType.Streaming:
        return 'entertainmentTypeWifi'
      case EntertainmentType.Livetv:
        return 'entertainmentTypeLivetv'
      default:
        return def
    }
  }

  return def
}

function getCost(amenity: Amenity): string {
  if (amenity) {
    switch (amenity.cost) {
      case AmenitiesCost.No:
        return 'no'
      case AmenitiesCost.Free:
        return 'free'
      case AmenitiesCost.Paid:
        return 'paid'
      default:
        return 'unknown'
    }
  }

  return 'unknown'
}
