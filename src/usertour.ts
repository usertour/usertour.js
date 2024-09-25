import type {ConditionalKeys} from 'type-fest'
import {detectBrowserTarget} from './detect-browser-target'

interface WindowWithUsertour extends Window {
  usertour?: Usertour

  USERTOURJS_QUEUE?: [string, Deferred | null, any[]][]
  USERTOURJS_ENV_VARS?: Record<string, any>
}

export interface Usertour {
  _stubbed: boolean

  load: () => Promise<void>

  init: (envId: string, options?: InitOptions) => void

  identify: (userId: string, attributes?: Attributes) => void

  reset: () => void

  isIdentified: () => boolean
}

export type InitOptions = {
  baseZIndex?: string
  userInfo?: InitUserInfo
}

export interface Attributes {
  [name: string]: string | number | boolean | null | undefined
}

export type InitUserInfo = {
  id: string
  name?: string
}

interface Deferred {
  resolve: () => void
  reject: (e: any) => void
}

var w: WindowWithUsertour = typeof window === 'undefined' ? ({} as any) : window
var usertour = w.usertour

if (!usertour) {
  //
  var urlPrefix = 'https://js.usertour.io/'

  // Initialize as an empty object (methods will be stubbed below)
  var loadPromise: Promise<void> | null = null
  usertour = w.usertour = {
    _stubbed: true,
    // Helper to inject the proper Usertour.js script/module into the document
    load: function (): Promise<void> {
      // Make sure we only load Usertour.js once
      if (!loadPromise) {
        loadPromise = new Promise(function (resolve, reject) {
          var script = document.createElement('script')
          script.async = true
          // Detect if the browser supports es2020
          var envVars = w.USERTOURJS_ENV_VARS || {}
          var browserTarget =
            envVars.USERTOURJS_BROWSER_TARGET ||
            detectBrowserTarget(navigator.userAgent)
          if (browserTarget === 'es2020') {
            script.type = 'module'
            script.src =
              envVars.USERTOURJS_ES2020_URL || urlPrefix + 'es2020/usertour.js'
          } else {
            script.src =
              envVars.USERTOURJS_LEGACY_URL ||
              urlPrefix + 'legacy/usertour.iife.js'
          }
          script.onload = function () {
            resolve()
          }
          script.onerror = function () {
            document.head.removeChild(script)
            loadPromise = null
            var e = new Error('Could not load Usertour.js')
            console.warn(e.message)
            reject(e)
          }
          document.head.appendChild(script)
        })
      }
      return loadPromise
    }
  } as Usertour

  // Initialize the queue, which will be flushed by Usertour.js when it loads
  var q = (w.USERTOURJS_QUEUE = w.USERTOURJS_QUEUE || [])

  /**
   * Helper to stub void-returning methods that should be queued
   */
  var stubVoid = function (
    // eslint-disable-next-line es5/no-rest-parameters
    method: ConditionalKeys<Usertour, (...args: any[]) => void>
  ) {
    // @ts-ignore
    usertour![method] = function () {
      var args = Array.prototype.slice.call(arguments)
      usertour!.load()
      q.push([method, null, args])
    } as any
  }

  // Helper to stub promise-returning methods that should be queued
  // var stubPromise = function (
  //   // eslint-disable-next-line es5/no-rest-parameters
  //   method: ConditionalKeys<Usertour, (...args: any[]) => Promise<void>>
  // ) {

  //   // @ts-ignore
  //   usertour![method] = function () {
  //     var args = Array.prototype.slice.call(arguments)
  //     usertour!.load()
  //     var deferred: Deferred
  //     var promise = new Promise<void>(function (resolve, reject) {
  //       deferred = {resolve: resolve, reject: reject}
  //     })
  //     q.push([method, deferred!, args])
  //     return promise
  //   } as any
  // }

  // Helper to stub methods that MUST return a value synchronously, and
  // therefore must support using a default callback until Usertour.js is
  // loaded.
  var stubDefault = function (
    method: ConditionalKeys<Usertour, () => any>,
    returnValue: any
  ) {
    // @ts-ignore
    usertour![method] = function () {
      return returnValue
    }
  }

  stubVoid('init')
  stubVoid('identify')
  stubVoid('reset')

  stubDefault('isIdentified', false)
}

export default usertour!
