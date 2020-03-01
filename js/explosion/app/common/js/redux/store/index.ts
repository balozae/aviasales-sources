import 'regenerator-runtime/runtime'
import { createStore, applyMiddleware, combineReducers, Store } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { enableBatching } from 'redux-batched-actions'
import { composeWithDevTools } from 'redux-devtools-extension'
import reduxThunk from 'redux-thunk'
import rootSaga from '../sagas/root.saga'
import metricsMiddleware from '../middlewares/metrics_middleware'
import reducers from '../reducers/root/explosion.reducer'
import guestiaMiddleware from '../middlewares/guestia_middleware'
import updateSearchDataMiddleware from '../middlewares/update_search_data_middleware'
import ReducerManager from './reducer_manager'
import MiddlewareManager from './middleware_manager'
import woodyMiddleware from '../middlewares/woody_middleware'
import userMiddleware from '../middlewares/user_middleware'
import ticketSubscriptionsMiddleware from '../middlewares/ticket_subscriptions.middleware'
import { updateCurrencyElementsMiddleware } from '../middlewares/update_currency_elements'

declare module 'redux' {
  interface Store<S> {
    reducerManager: ReducerManager
    middlewareManager: MiddlewareManager
  }
}

export function configureStore(): Store<any, any> {
  const reducerManager = new ReducerManager(reducers, [enableBatching, combineReducers])
  const middlewareManager = new MiddlewareManager()
  const sagaMiddleware = createSagaMiddleware()

  const store: Store = createStore(
    reducerManager.reduce,
    {},
    composeWithDevTools(
      applyMiddleware(
        reduxThunk,
        sagaMiddleware,
        metricsMiddleware,
        guestiaMiddleware,
        updateSearchDataMiddleware,
        woodyMiddleware,
        userMiddleware,
        ticketSubscriptionsMiddleware,
        middlewareManager.enhancer,
        updateCurrencyElementsMiddleware,
      ),
    ),
  )

  sagaMiddleware.run(rootSaga)
  store.reducerManager = reducerManager
  store.middlewareManager = middlewareManager
  return store
}

export default configureStore()
