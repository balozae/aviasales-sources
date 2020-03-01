import {
  AircraftResponseInfoAmenities,
  AircraftResponseInfoDelay,
  AircraftResponseInfo,
  Amenities,
  Delay,
  AircraftInfo,
  Dirty,
  AmenitiesCost,
} from './flight_amenities.types'

function formatAmenities(amenities: Dirty<AircraftResponseInfoAmenities>): Amenities {
  let food: object = {}
  let entertainment: object = {}
  let wifi: object = {}
  let power: object = {}
  let nonAlcoholic: object = {}
  let alcoholic: object = {}

  if (amenities) {
    if (amenities.food) {
      const foodTypeParsed = amenities.food.summary.split('_') || [null, null]
      const foodType = foodTypeParsed.length > 2 ? foodTypeParsed[2] : foodTypeParsed[1]
      const isPremium = foodTypeParsed.length > 2

      food = {
        cost: amenities.food.summary.split('_')[0] || 'no',
        type: foodType,
        isPremium,
      }
    }

    if (amenities.wifi) {
      const wifiTypeParsed = amenities.wifi.summary.split('_')

      wifi = {
        cost: wifiTypeParsed[0] || 'no',
        type: wifiTypeParsed[1] || '',
      }
    }

    if (amenities.power) {
      const powerTypeParsed = amenities.power.summary.split('_')

      power = {
        cost: powerTypeParsed[0] || 'no',
        type: powerTypeParsed[1] || '',
      }
    }

    if (amenities.entertainment) {
      const entertainmentTypeParsed = amenities.entertainment.summary.split('_')

      entertainment = {
        cost: entertainmentTypeParsed[0] || 'no',
        type: entertainmentTypeParsed[1] || '',
      }
    }

    if (amenities.beverage?.exists) {
      if (amenities.beverage.type === 'nonalcoholic') {
        nonAlcoholic = {
          cost: amenities.beverage.nonalcoholic_paid ? AmenitiesCost.Paid : AmenitiesCost.Free,
        }
        alcoholic = { cost: AmenitiesCost.No }
      } else if (
        ['alcoholic_and_nonalcoholic', 'premium_alcoholic'].includes(amenities.beverage.type)
      ) {
        nonAlcoholic = {
          cost: amenities.beverage.nonalcoholic_paid ? AmenitiesCost.Paid : AmenitiesCost.Free,
        }
        alcoholic = {
          cost: amenities.beverage.alcoholic_paid ? AmenitiesCost.Paid : AmenitiesCost.Free,
        }
      }
    }
  }

  return {
    wifi,
    food,
    entertainment,
    power,
    alcoholic,
    nonAlcoholic,
  } as Amenities
}

function formatDelay(delay: Dirty<AircraftResponseInfoDelay>): Dirty<Delay> {
  if (delay) {
    return {
      ontimePercent: delay.ontime_percent || 1,
      mean: delay.mean || 0,
      min: delay.min || 0,
      max: delay.max || 0,
    }
  }
}

export function aircraftInfoAdapter(
  flightInfo: AircraftResponseInfo,
  aircraftName: string,
  rating?: number,
): AircraftInfo {
  return {
    amenities: formatAmenities(flightInfo.amenities),
    delay: formatDelay(flightInfo.delay),
    seats: {
      pitch: (flightInfo.seat && flightInfo.seat.pitch) || 0,
      width:
        (flightInfo.seat &&
          (flightInfo.seat.width ? flightInfo.seat.width : flightInfo.seat.width_description)) ||
        0,
    },
    seatsLayout:
      (flightInfo.amenities &&
        flightInfo.amenities.layout &&
        flightInfo.amenities.layout.row_layout) ||
      '',
    rating: rating && +rating.toFixed(1),
    aircraftName,
  }
}
