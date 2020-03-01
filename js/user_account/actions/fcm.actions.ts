import guestia from 'guestia/client'
import { ThunkAction } from 'redux-thunk'
import { AppState, AppActions } from 'user_account/types/app.types'
import Cookies from 'oatmeal-cookie'
import FCM from 'fcm-client'
import mamka from 'common/bindings/mamka'
import flagr from 'common/utils/flagr_client_instance'

declare global {
  interface Window {
    Notification: Notification
  }
}

const fcm = new FCM(
  {
    apiKey: 'AIzaSyA0DDA-Hn5mNuBr9ek50auUqfmeA76Qk04',
    authDomain: 'aviasales-eb4a0.firebaseapp.com',
    databaseURL: 'https://aviasales-eb4a0.firebaseio.com',
    projectId: 'aviasales-eb4a0',
    storageBucket: 'aviasales-eb4a0.appspot.com',
    messagingSenderId: '977852946617',
    appId: '1:977852946617:web:1800db427a28af2497e368',
    measurementId: 'G-BXM5E5W7ZW',
  },
  {
    sendTokenUrl: 'https://wpush.avs.io/devices',
    deleteTokenUrl: 'https://wpush.avs.io/devices',
    onRequestPermissionsShown: () => {
      mamka('send_event', {
        name: 'request_permission_popop_shown',
      })
    },
    onRequestPermissionsClick: (click, status) => {
      if (status === 'granted') {
        mamka('send_event', {
          name: `request_permission_allow`,
        })
      }

      if (status === 'denied') {
        mamka('send_event', {
          name: `request_permission_decline`,
          meta: {
            decline: click,
          },
        })
      }
    },
  },
)

export const initFCM = (): ThunkAction<void, AppState, void, AppActions> => async () => {
  try {
    if (flagr.is('avs-exp-pushNotifications')) {
      const jwt = guestia.getJWT()
      const auid = Cookies.get('auid')
      if (auid) {
        await fcm.setUserInfo(auid, { jwt }).subscribe()
      }
    }
  } catch (error) {
    //
  }
}
