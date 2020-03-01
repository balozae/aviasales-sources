class MiddlewareManager {
  private middlewares: Function[] = []

  /**
   * Use middleware from this instance
   */
  enhancer = (store) => (next) => (act) => {
    const nextMiddleware = (remaining) => (action) =>
      remaining.length
        ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action)
        : next(action)
    nextMiddleware(this.middlewares)(act)
  }

  /**
   * Add middleware
   *
   * @param fn {Function | Function[}
   */
  add = (fn: Function | Function[]) => {
    const middlewares = Array.isArray(fn) ? fn : [fn]
    this.middlewares = this.middlewares.concat(middlewares)

    return this
  }

  /**
   * Remove middleware
   *
   * @param fn {Function | Function[}
   */
  remove = (fn: Function | Function[]) => {
    const middlewares = Array.isArray(fn) ? fn : [fn]

    middlewares.map((middleware) => {
      this.middlewares.splice(this.middlewares.indexOf(middleware), 1)
    })

    return this
  }
}

export default MiddlewareManager
