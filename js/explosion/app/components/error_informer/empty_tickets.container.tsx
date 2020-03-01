import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { TripClass } from 'common/types'
import TripClassesInformer from './trip_classes/trip_classes'
import {
  tripClassInformerShow,
  onChangeTripClass,
  emptyTicketsInformerShow,
} from 'common/js/redux/actions/empty_tickets.actions'
import EmptyTicketsInformer from './empty_tickets/empty_tickets'

interface EmptyTicketsContainerOwnProps {}

interface EmptyTicketsContainerStateProps {
  tripClass: TripClass
}

interface EmptyTicketsContainerDispatchProps {
  tripClassInformerShow: Function
  onChangeTripClass: (tripClass: TripClass) => void
  emptyTicketsInformerShow: Function
}

type EmptyTicketsContainerProps = EmptyTicketsContainerStateProps &
  EmptyTicketsContainerOwnProps &
  EmptyTicketsContainerDispatchProps

const checkedTripClasses = [TripClass.PremiumEconomy, TripClass.FirstClass]

const EmptyTicketsContainer: React.FC<EmptyTicketsContainerProps> = (props) => {
  const showTripClassInformer = checkedTripClasses.includes(props.tripClass)

  useEffect(() => {
    if (showTripClassInformer) {
      props.tripClassInformerShow()
    } else {
      props.emptyTicketsInformerShow()
    }
  }, [])

  if (showTripClassInformer) {
    return (
      <TripClassesInformer
        tripClass={props.tripClass}
        onChangeTripClass={props.onChangeTripClass}
      />
    )
  }
  return <EmptyTicketsInformer />
}

const mapStateToProps = (state) => ({
  tripClass: state.searchParams.tripClass,
})

const mapDispatchToProps = (dispatch) => ({
  tripClassInformerShow: () => dispatch(tripClassInformerShow()),
  emptyTicketsInformerShow: () => dispatch(emptyTicketsInformerShow()),
  onChangeTripClass: (tripClass: TripClass) => dispatch(onChangeTripClass(tripClass)),
})

export default connect<EmptyTicketsContainerStateProps, EmptyTicketsContainerDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(EmptyTicketsContainer)
