import store from '../../common/js/redux/store'
import { TravelPayoutsBar } from './travelpayouts_bar.types'

declare global {
  interface Window {
    initTravelpayoutsBar: (affMarker: string | number) => void
  }
}

window.initTravelpayoutsBar = (affMarker) => {
  store.dispatch({
    type: 'SET_TRAVELPAYOUTS_BAR_PROPS',
    props: {
      isShow: true,
      affMarker,
    } as TravelPayoutsBar,
  })
}

const script = document.createElement('script')
script.id = 'travelpayouts-script'
script.async = true
script.src = '//www.travelpayouts.com/toolbar/toolbar_generator.js?v=0.0.1'
document.body.appendChild(script)
