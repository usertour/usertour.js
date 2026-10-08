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

  /**
   * Resolves to {@link AttributesWriteResult} on Usertour.js newer than
   * v0.9.5; an older bundle resolves with `undefined`.
   */
  identify: (
    userId: string,
    attributes?: Attributes,
    opts?: IdentifyOptions
  ) => Promise<AttributesWriteResult>

  /**
   * Resolves to {@link AttributesWriteResult} on Usertour.js newer than
   * v0.9.5; an older bundle resolves with `undefined`.
   *
   * @param opts - Deprecated: anonymous identities cannot carry an identity
   * token (your backend never sees the SDK-generated anonymous id, so it can
   * never sign one). This parameter has no effect.
   */
  identifyAnonymous: (
    attributes?: Attributes,
    opts?: IdentifyOptions
  ) => Promise<AttributesWriteResult>

  /**
   * Resolves to {@link AttributesWriteResult} on Usertour.js newer than
   * v0.9.5; an older bundle resolves with `undefined`.
   */
  updateUser: (
    attributes: Attributes,
    opts?: IdentifyOptions
  ) => Promise<AttributesWriteResult>

  /**
   * Resolves to {@link AttributesWriteResult} on Usertour.js newer than
   * v0.9.5; an older bundle resolves with `undefined`.
   */
  group: (
    groupId: string,
    attributes?: Attributes,
    opts?: GroupOptions
  ) => Promise<AttributesWriteResult>

  /**
   * Resolves to {@link AttributesWriteResult} on Usertour.js newer than
   * v0.9.5; an older bundle resolves with `undefined`.
   */
  updateGroup: (
    attributes: Attributes,
    opts?: GroupOptions
  ) => Promise<AttributesWriteResult>

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
   * Turn the SDK's console logging on or off. Off by default; effective at
   * once and remembered for future page loads until switched off. The same
   * gate opens for one page load with `?usertour_debug=1` in the URL.
   */
  setDebug(enabled: boolean): void

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

/**
 * Attribute values: a literal, `null` to remove the attribute, a `Date`
 * (sent as ISO 8601 UTC), or exactly one operation object.
 *
 * Operation objects are computed server-side and need a Usertour server
 * newer than v0.9.5 (self-hosted). See
 * https://docs.usertour.io/developers/usertourjs-reference/overview#attributes
 */
export interface Attributes {
  [name: string]: AttributeValue | AttributeOperation | LegacyAttributeChange
}

type AttributeLiteral = string | number | boolean | null | undefined
type AttributeLiteralOrList = AttributeLiteral | AttributeLiteral[]
type AttributeValue = AttributeLiteralOrList | Date

/**
 * Pins the type of the attribute definition when this write creates it. It
 * never retypes an existing definition — a conflicting `data_type` is
 * rejected; change the type in the attribute settings instead.
 */
type AttributeDataType = 'string' | 'boolean' | 'number' | 'datetime' | 'list'

/** Exactly one operation per attribute. */
type AttributeOperation =
  | {
      /** Set the value (same as a literal), optionally pinning `data_type`. */
      set: AttributeValue
      data_type?: AttributeDataType
      set_once?: never
      add?: never
      union?: never
      remove?: never
      subtract?: never
      append?: never
      prepend?: never
    }
  | {
      /** Set the value only when the attribute has no value yet. */
      set_once: AttributeValue
      data_type?: AttributeDataType
      set?: never
      add?: never
      union?: never
      remove?: never
      subtract?: never
      append?: never
      prepend?: never
    }
  | {
      /** Add to a Number attribute (negative to subtract); a missing value starts at 0. */
      add: number
      set?: never
      set_once?: never
      union?: never
      remove?: never
      data_type?: never
      subtract?: never
      append?: never
      prepend?: never
    }
  | {
      /** Append the value(s) not yet present to a List attribute; a missing list starts empty. */
      union: AttributeLiteralOrList
      set?: never
      set_once?: never
      add?: never
      remove?: never
      data_type?: never
      subtract?: never
      append?: never
      prepend?: never
    }
  | {
      /** Remove every matching value from a List attribute; a missing attribute stays undefined. */
      remove: AttributeLiteralOrList
      set?: never
      set_once?: never
      add?: never
      union?: never
      data_type?: never
      subtract?: never
      append?: never
      prepend?: never
    }

/**
 * Operation spellings the SDK still translates for compatibility — exactly
 * one per attribute, like `AttributeOperation`. Each one is deprecated; the
 * SDK rewrites it and logs a warning.
 */
type LegacyAttributeChange =
  | {
      /** @deprecated Use `{ add: -n }`. */
      subtract: number
      append?: never
      prepend?: never
      set?: never
      set_once?: never
      add?: never
      union?: never
      remove?: never
      data_type?: never
    }
  | {
      /** @deprecated Use `{ union: values }` — lists are deduplicated sets. */
      append: AttributeLiteralOrList
      subtract?: never
      prepend?: never
      set?: never
      set_once?: never
      add?: never
      union?: never
      remove?: never
      data_type?: never
    }
  | {
      /** @deprecated Use `{ union: values }` — list order is never observable. */
      prepend: AttributeLiteralOrList
      subtract?: never
      append?: never
      set?: never
      set_once?: never
      add?: never
      union?: never
      remove?: never
      data_type?: never
    }

/**
 * What an identify / update call reports back on Usertour.js newer than
 * v0.9.5 (Cloud always serves the newest bundle; self-hosted, it is the
 * bundle your server serves): the write succeeded, and `rejected` names any
 * attribute the server refused (a value that does not fit the attribute's
 * type, an operation written incorrectly, a system-generated attribute) with
 * the reason. Every other key was written. The SDK also logs a warning per
 * refused attribute.
 *
 * An older bundle resolves these calls with `undefined`, so read the result
 * only once your server runs a version newer than v0.9.5.
 */
export interface AttributesWriteResult {
  rejected: Array<{codeName: string; reason: string}>
}

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

/** Events are immutable facts: a literal, a `Date`, or `{set, data_type}` only. */
export interface EventAttributes {
  [name: string]: AttributeValue | EventAttributeChange
}

interface EventAttributeChange {
  set: AttributeValue
  /** Pins the type of a new event attribute definition; never retypes an existing one. */
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
  resolve: (value?: any) => void
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

  // Whether the loader still owns the queue, i.e. no Usertour.js bundle has
  // loaded yet. A bundle announces itself two ways, and either one ends the
  // loader's ownership: it marks window.usertour as no longer stubbed when
  // it installs its API, and it takes the queue over (window.USERTOURJS_QUEUE
  // = undefined) before replaying it — unless nothing was queued, in which
  // case older bundles leave the queue alone, which is why the mark matters.
  // A stub still reachable under its name after that is a leftover the loaded
  // bundle does not implement, and must warn and drop instead of enqueueing:
  // older bundles keep leftover stubs across the API merge and replay the
  // live array, so a call re-enqueued from inside the replay spins the main
  // thread and grows the queue until the tab runs out of memory, and a call
  // queued after the replay would sit in the queue forever. The check keeps
  // every method — including ones newer than the loaded bundle — safe on
  // every bundle version.
  var queueOwned = function (): boolean {
    var current = w.usertour
    return w.USERTOURJS_QUEUE === q && !!current && current._stubbed
  }

  var warnUnsupported = function (method: keyof Usertour) {
    console.warn('usertour.js: ' + method + ' is not supported and was ignored')
  }

  /**
   * Helper to stub void-returning methods that should be queued
   */
  var stubVoid = function (
    // eslint-disable-next-line es5/no-rest-parameters
    method: ConditionalKeys<Usertour, (...args: any[]) => void>
  ) {
    // @ts-ignore
    usertour![method] = function () {
      if (!queueOwned()) {
        warnUnsupported(method)
        return
      }
      var args = Array.prototype.slice.call(arguments)
      usertour!.load()
      q.push([method, null, args])
    } as any
  }

  // Helper to stub promise-returning methods that should be queued. The
  // promise settles with whatever the real method returns once the queue is
  // replayed, so a queued identify() still resolves to its write result.
  var stubPromise = function (
    // eslint-disable-next-line es5/no-rest-parameters
    method: ConditionalKeys<Usertour, (...args: any[]) => Promise<any>>
  ) {
    // @ts-ignore
    usertour![method] = function () {
      if (!queueOwned()) {
        warnUnsupported(method)
        return Promise.reject(
          new Error('usertour.js: ' + method + ' is not supported')
        )
      }
      var args = Array.prototype.slice.call(arguments)
      usertour!.load()
      var deferred: Deferred
      var promise = new Promise<any>(function (resolve, reject) {
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

  // Helper to stub legacy methods no SDK bundle implements: warn and drop
  // without ever queueing (see queueOwned for why a queued call to a method
  // the bundle lacks is dangerous).
  var stubUnsupported = function (method: keyof Usertour) {
    // @ts-ignore
    usertour![method] = function () {
      warnUnsupported(method)
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
  stubVoid('setDebug')
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
