import axios from 'axios';
import Cookies from 'oatmeal-cookie';
import { AbortError, ServerError, TimeoutError } from 'utils/errors';

export const extendCookieParams = (params, cookieKeys) => {
  const cookieParams = cookieKeys.reduce((acc, name) => {
    const cookieParam = Cookies.get(name);
    if (cookieParam !== undefined) {
      return { ...acc, [name]: cookieParam };
    }
    return acc;
  }, {});
  return { ...params, ...cookieParams };
};

export default class FetchWrapper {
  constructor() {
    this.lastAbortSignal = null;
    this.abortCallbacks = {};
  }

  request(url, options) {
    let timeout = null;
    const callbacks = {};

    const promise = new Promise(async (resolve, reject) => {
      callbacks.resolve = resolve;
      callbacks.reject = reject;

      let response;
      try {
        response = await axios(url, options);
        if (response.status !== 200) {
          const responseText = response.statusText;
          reject(new ServerError(responseText, response));
        }

        clearTimeout(timeout);
        resolve(response);
      } catch (err) {
        let errMessage = `Error in fetch to ${url}`;

        if (err.response && err.response.data) {
          errMessage += `. Server response: ${JSON.stringify(err.response.data)}`;
        } else if (err.message) {
          errMessage += `. Err ${err.message}`;
        } else if (typeof err === 'string') {
          errMessage += `. Err ${err}`;
        }

        reject(new ServerError(errMessage, err.response));
      }
    });

    this.abortCallbacks[this.lastAbortSignal] = null;
    this.lastAbortSignal = FetchWrapper.genAbortSignal();
    this.abortCallbacks[this.lastAbortSignal] = () =>
      callbacks.reject(new AbortError('fetch request was aborted'));

    if (options.timeout) {
      timeout = setTimeout(() => {
        callbacks.reject(
          new TimeoutError(`fetch request was timed out with timeout ${options.timeout}ms`),
        );
      }, options.timeout);
    }

    return promise;
  }

  get(url, options) {
    return this.request(url, { ...options, method: 'get' });
  }

  post(url, options) {
    return this.request(url, { ...options, method: 'post' });
  }

  abort() {
    if (this.lastAbortSignal && this.abortCallbacks[this.lastAbortSignal]) {
      this.abortCallbacks[this.lastAbortSignal]();
    }
  }

  static genAbortSignal() {
    return Math.random()
      .toString(36)
      .substr(2, 9);
  }
}
