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

  init: (token: string) => void

  identify: (
    userId: string,
    attributes?: Attributes,
    opts?: IdentifyOptions
  ) => Promise<void>

  /**
   * @param opts - Deprecated: anonymous identities cannot carry an identity
   * token (your backend never sees the SDK-generated anonymous id, so it can
   * never sign one). This parameter has no effect.
   */
  identifyAnonymous: (
    attributes?: Attributes,
    opts?: IdentifyOptions
  ) => Promise<void>

  updateUser: (attributes: Attributes, opts?: IdentifyOptions) => Promise<void>

  group: (
    groupId: string,
    attributes?: Attributes,
    opts?: GroupOptions
  ) => Promise<void>

  updateGroup: (attributes: Attributes, opts?: GroupOptions) => Promise<void>

  track(
    name: string,
    attributes?: EventAttributes,
    opts?: TrackOptions
  ): Promise<void>

  isIdentified: () => boolean

  start: (contentId: string, opts?: StartOptions) => Promise<void>

  isStarted: (contentId: string) => boolean

  endAll: () => Promise<void>

  openResourceCenter: () => void

  closeResourceCenter: () => void

  toggleResourceCenter: () => void

  showResourceCenterLauncher: () => void

  hideResourceCenterLauncher: () => void

  isResourceCenterOpen: () => boolean

  reset: () => void

  remount: () => void

  // eslint-disable-next-line es5/no-rest-parameters
  on(eventName: string, listener: (...args: any[]) => void): void

  // eslint-disable-next-line es5/no-rest-parameters
  off(eventName: string, listener: (...args: any[]) => void): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged). Use `registerCustomInput(cssSelector, getValue)` instead.
   */
  setCustomInputSelector(customInputSelector: string | null): void

  registerCustomInput(
    cssSelector: string,
    getValue?: (el: Element) => string
  ): void

  setCustomNavigate(customNavigate: ((url: string) => void) | null): void

  setUrlFilter(urlFilter: ((url: string) => string) | null): void

  setLinkUrlDecorator(linkUrlDecorator: ((url: string) => string) | null): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setInferenceAttributeNames(attributeNames: string[]): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setInferenceAttributeFilter(
    attributeName: string,
    filters: StringFilters
  ): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setInferenceClassNameFilter(filters: StringFilters): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged). To control scrolling behavior, use `setCustomScrollIntoView(fn)` instead.
   */
  setScrollPadding(scrollPadding: ScrollPadding | null): void

  setCustomScrollIntoView(scrollIntoView: ((el: Element) => void) | null): void

  _setTargetEnv(targetEnv: unknown): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setShadowDomEnabled(shadowDomEnabled: boolean): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setPageTrackingDisabled(pageTrackingDisabled: boolean): void

  setBaseZIndex(baseZIndex: number): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged).
   */
  setSessionTimeout(hours: number): void

  setTargetMissingSeconds(seconds: number): void

  /**
   * @deprecated Not supported by the current SDK — the call is ignored (a warning is logged). For a self-hosted backend set `window.USERTOURJS_ENV_VARS.WS_URI` before the SDK loads instead.
   */
  setServerEndpoint(serverEndpoint: string | null | undefined): void

  disableEvalJs(): void
}

export interface Attributes {
  [name: string]: AttributeLiteralOrList | AttributeChange
}

type AttributeLiteral = string | number | boolean | null | undefined
type AttributeLiteralOrList = AttributeLiteral | AttributeLiteral[]

interface AttributeChange {
  set?: AttributeLiteralOrList
  set_once?: AttributeLiteralOrList
  add?: string | number
  subtract?: string | number
  append?: AttributeLiteralOrList
  prepend?: AttributeLiteralOrList
  remove?: AttributeLiteralOrList
  data_type?: AttributeDataType
}

type AttributeDataType = 'string' | 'boolean' | 'number' | 'datetime' | 'list'

export type IdentifyOptions = {
  /**
   * Identity token: a JWT minted by your backend, HS256-signed with your
   * environment's signing secret — { sub: userId, companyId?, exp? }.
   * See https://docs.usertour.io/developers/identity-verification
   */
  token?: string
  /**
   * @deprecated Never had any effect (identity verification shipped with
   * JWT identity tokens instead). Use `token`.
   */
  signature?: string
}

export interface GroupOptions {
  /**
   * Identity token whose companyId claim must match this group() call.
   * Supersedes the token supplied to identify().
   */
  token?: string
  /**
   * @deprecated Never had any effect (identity verification shipped with
   * JWT identity tokens instead). Use `token`.
   */
  signature?: string
  membership?: Attributes
}

export interface EventAttributes {
  [name: string]: AttributeLiteral | EventAttributeChange
}

interface EventAttributeChange {
  set?: AttributeLiteral
  data_type?: AttributeDataType
}

export interface TrackOptions {
  userOnly?: boolean
}

export interface StartOptions {
  once?: boolean
  continue?: boolean
}


interface ScrollPadding {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

type StringFilter = ((className: string) => boolean) | RegExp

type StringFilters = StringFilter | StringFilter[]

interface Deferred {
  resolve: () => void
  reject: (e: any) => void
}

var w: WindowWithUsertour = typeof window === 'undefined' ? ({} as any) : window
var usertour = w.usertour

if (!usertour) {
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
  var stubPromise = function (
    // eslint-disable-next-line es5/no-rest-parameters
    method: ConditionalKeys<Usertour, (...args: any[]) => Promise<void>>
  ) {
    // @ts-ignore
    usertour![method] = function () {
      var args = Array.prototype.slice.call(arguments)
      usertour!.load()
      var deferred: Deferred
      var promise = new Promise<void>(function (resolve, reject) {
        deferred = {resolve: resolve, reject: reject}
      })
      q.push([method, deferred!, args])
      return promise
    } as any
  }

  // Helper to stub methods that MUST return a value synchronously, and
  // therefore must support using a default callback until Usertour.js is
  // loaded.
  var stubDefault = function (
    method: ConditionalKeys<Usertour, (...args: any[]) => any>,
    returnValue: any
  ) {
    // @ts-ignore
    usertour![method] = function () {
      return returnValue
    }
  }

  // Helper to stub legacy methods the current SDK does not implement. These
  // must NOT queue: the SDK-side queue drain dispatches each entry to whatever
  // hangs on window.usertour under that name, and on older SDK bundles the
  // leftover queueing stub survives the API merge — so a queued call to an
  // unimplemented method re-enqueued itself from inside the drain loop,
  // spinning the main thread and growing the queue until the tab ran out of
  // memory. Warning and dropping the call here keeps every loader/bundle
  // version combination safe.
  var stubUnsupported = function (method: keyof Usertour) {
    // @ts-ignore
    usertour![method] = function () {
      console.warn('usertour.js: ' + method + ' is not supported and was ignored')
    } as any
  }

  // Methods that return void and should be queued
  stubVoid('disableEvalJs')
  stubVoid('init')
  stubVoid('off')
  stubVoid('on')
  stubVoid('registerCustomInput')
  stubVoid('reset')
  stubVoid('setBaseZIndex')
  stubVoid('setTargetMissingSeconds')
  stubVoid('setCustomNavigate')
  stubVoid('setCustomScrollIntoView')
  stubVoid('setUrlFilter')
  stubVoid('setLinkUrlDecorator')
  stubVoid('openResourceCenter')
  stubVoid('closeResourceCenter')
  stubVoid('toggleResourceCenter')
  stubVoid('showResourceCenterLauncher')
  stubVoid('hideResourceCenterLauncher')

  // Legacy methods with no implementation in the current SDK (also marked
  // @deprecated on the interface): warn-and-drop instead of queueing.
  stubUnsupported('setCustomInputSelector')
  stubUnsupported('setSessionTimeout')
  stubUnsupported('setInferenceAttributeFilter')
  stubUnsupported('setInferenceAttributeNames')
  stubUnsupported('setInferenceClassNameFilter')
  stubUnsupported('setScrollPadding')
  stubUnsupported('setServerEndpoint')
  stubUnsupported('setShadowDomEnabled')
  stubUnsupported('setPageTrackingDisabled')

  // Methods that return promises and should be queued
  stubPromise('endAll')
  stubPromise('group')
  stubPromise('identify')
  stubPromise('identifyAnonymous')
  stubPromise('start')
  stubPromise('track')
  stubPromise('updateGroup')
  stubPromise('updateUser')

  // Methods that synchronously return and can be stubbed with default return
  // values and are not queued
  stubDefault('isIdentified', false)
  stubDefault('isResourceCenterOpen', false)
  stubDefault('isStarted', false)
}

export default usertour!
