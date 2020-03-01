import axios from 'axios'
import { IFlagsConfig, IFlag, IFlagEvents } from './Flagr.types'

/**
 * Simple Flagr client
 *
 * TODO call update only when data updated
 */
class Flagr {
  /**
   * Flagr API config
   *
   */
  static defaults: IFlagsConfig = {
    evaluateUrl: '/api/v1/evaluate',
    serializeSymbol: '-',
  }

  private entityID: string
  private config: IFlagsConfig
  private basicContext: { [key: string]: any }
  private flags = new Map<string, IFlag>()
  private events: IFlagEvents = {
    update: [],
  }

  /**
   * Create instance
   *
   * @param auid {string}
   * @param basicContext {{ [key: string]: any }}
   * @param flagrConfig {Partial<IFlagsConfig>}
   */
  constructor(
    auid: string,
    basicContext: { [key: string]: any } = {},
    flagrConfig: Partial<IFlagsConfig> = {},
  ) {
    this.entityID = auid
    this.config = { ...Flagr.defaults, ...flagrConfig }
    this.basicContext = { ...basicContext }
  }

  /**
   * Add event listener
   *
   * @param event {string}
   * @param callback {'*' | (() => any)}
   */
  on(event: string, callback: (...args: any[]) => any) {
    if (this.events[event]) {
      this.events[event].push(callback)
    }
    return this
  }

  /**
   * Remove event listener
   *
   * @param event {string}
   * @param callback {() => any}
   */
  off(event: string, callback: '*' | ((...args: any[]) => any)) {
    if (this.events[event]) {
      if (callback === '*') {
        this.events[event] = []
        return this
      }

      const index = this.events[event].indexOf(callback)

      // TODO Check!
      if (index >= 0) {
        this.events[event].splice(index, 1)
      }
    }

    return this
  }

  /**
   * Add flag
   *
   * @param key {string}
   * @param defaultValue {any}
   * @param entityContext {{[key: string]: any}|void}
   */
  add(key: string, defaultValue: any, entityContext: { [key: string]: any } = {}) {
    this.flags.set(key, { defaultValue, entityContext })
    return this
  }

  /**
   * Check whether flag exists and loaded or not
   *
   * @param key {string}
   */
  isReady(key: string) {
    return this.flags.has(key) && !!this.flags.get(key)!.evaluationResult
  }

  /**
   * Get flag's variantKey or defaultValue
   *
   * @param key {string}
   * @param defaultValue {any|void}
   */
  get(key: string, defaultValue?: any) {
    if (!this.flags.has(key)) {
      throw 'Can not find flag with key: ' + key
    }

    const flag = this.flags.get(key)

    let evaluationResult

    if (flag!.evaluationResult && flag!.evaluationResult!.variantKey) {
      evaluationResult = flag!.evaluationResult!.variantKey
    }

    if (
      flag!.evaluationResult &&
      flag!.evaluationResult!.variantAttachment &&
      Object.keys(flag!.evaluationResult!.variantAttachment!).length
    ) {
      evaluationResult = flag!.evaluationResult!.variantAttachment
    }

    if (typeof evaluationResult !== 'undefined') {
      return evaluationResult
    }

    if (typeof defaultValue !== 'undefined') {
      return defaultValue
    }

    return flag!.defaultValue
  }

  /**
   * Transform values on or off to boolean
   *
   * @param key {string}
   * @param defaultValue {boolean|void}
   */
  is(key: string, defaultValue?: boolean) {
    const variantKey = this.get(key, defaultValue)

    switch (variantKey) {
      case 'on':
        return true
      case 'off':
        return false
      default:
        return variantKey
    }
  }

  /**
   * Update basic params and update all flags
   * For example on change language
   *
   * @param newContext {{[key: string]: any}}
   */
  updateBasicContext(newContext: { [key: string]: any }): Promise<string[]> {
    this.basicContext = { ...this.basicContext, ...newContext }
    return this.evaluation(true)
  }

  /**
   * Load flags without evaluationResults
   */
  register(): Promise<string[]> {
    return this.evaluation()
  }

  /**
   * Serialize flags
   */
  serialize(): string[] {
    const flags: string[] = []

    this.flags.forEach((flag, key) => {
      if (flag.evaluationResult && !flag.error) {
        flags.push(
          `${key}${this.config.serializeSymbol}${flag.evaluationResult.variantKey || 'null'}`,
        )
      }
    })

    return flags
  }

  /**
   * Returns new object of basic context
   */
  getBasicContext() {
    return { ...this.basicContext }
  }

  /**
   * Update flags depending updateAll value
   * If updateAll is true, update all flags
   *
   * Mark flags with errors
   *
   * @param updateAll {boolean}
   */
  private async evaluation(updateAll: boolean = false): Promise<string[]> {
    try {
      let entityContext = {}
      const flagKeys: string[] = []

      this.flags.forEach((flag, key) => {
        if (!flag.error && (updateAll || !flag.evaluationResult)) {
          entityContext = { ...entityContext, ...flag.entityContext }
          flagKeys.push(key)
        }
      })

      if (!flagKeys.length) {
        return []
      }

      const {
        data: { evaluationResults },
      } = await axios.post(`${this.config.evaluateUrl}`, {
        entities: [
          {
            entityID: this.entityID,
            entityContext: { ...entityContext, ...this.basicContext },
          },
        ],
        flagKeys,
      })

      const updatedKeys: string[] = []
      evaluationResults.forEach((evaluationResult) => {
        if (evaluationResult.flagID && this.flags.has(evaluationResult.flagKey)) {
          const flagData = this.flags.get(evaluationResult.flagKey)
          flagData!.evaluationResult = evaluationResult
          updatedKeys.push(evaluationResult.flagKey)
        } else {
          this.flags.get(evaluationResult.flagKey)!.error = true
        }
      })

      this.invoke('update', updatedKeys, updateAll)
      return updatedKeys
    } catch (e) {
      return []
    }
  }

  private invoke(event: string, param?: any, param1?: any, param2?: any) {
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(param, param1, param2))
    }
  }
}

export default Flagr
