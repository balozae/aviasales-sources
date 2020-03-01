import { Reducer, AnyAction } from 'redux'

type AnyReducer = Reducer<any>
type AnyState = { [key: string]: AnyReducer }

class ReducerManager {
  private reducers: AnyState = {}
  private combineFunctions: Array<(param: AnyState | AnyReducer) => any>
  private combined: AnyReducer
  private stateDataToRemove: string[] = []

  constructor(
    staticReducers: { [key: string]: any },
    combineFunctions: Array<(param: AnyState | AnyReducer) => any>,
  ) {
    this.combineFunctions = combineFunctions.slice().reverse()
    this.reducers = { ...staticReducers }
    this.recombine()
  }

  /**
   * The root reducer function exposed by this object
   *
   * This will be passed to the store
   * If any reducers have been removed, clean up their state first
   * Delegate to the combined reducer
   *
   * @param state {AnyState}
   * @param action {AnyAction}
   */
  reduce = (state: AnyState, action: AnyAction): AnyState => {
    let newState = state

    if (this.stateDataToRemove.length > 0) {
      newState = { ...state }
      for (let key of this.stateDataToRemove) {
        delete newState[key]
      }
      this.stateDataToRemove = []
    }

    return this.combined(newState, action)
  }

  /**
   * Adds a new reducer with the specified key
   *
   * Add the reducer to the reducer mapping
   * Generate a new combined reducer
   *
   * @param reducers {{[key: string]: AnyReducer}}
   */
  // TODO: fix case when you add new reducers but state doesn't get this reducers initial states
  // so you have to call any action to init this new reducers
  add = (reducers: { [key: string]: AnyReducer }) => {
    this.reducers = { ...reducers, ...this.reducers }
    this.recombine()

    return this
  }

  /**
   * Removes a reducer with the specified key
   *
   * Remove it from the reducer mapping
   * Add the key to the list of keys to clean up
   * Generate a new combined reducer
   *
   * @param key {string | string[]}
   */
  remove = (key: string | string[]) => {
    const keys = Array.isArray(key) ? key : [key]

    keys.map((keyToRemove) => {
      if (!this.reducers[keyToRemove]) {
        return
      }
      delete this.reducers[keyToRemove]
      this.stateDataToRemove.push(keyToRemove)
    })

    this.recombine()

    return this
  }

  private recombine() {
    this.combined = this.combineFunctions.reduce((acc, current) => current(acc), this.reducers)
  }
}

export default ReducerManager
