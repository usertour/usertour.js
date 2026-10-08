// The loader's stubs enqueue only while the loader still owns
// window.USERTOURJS_QUEUE. Every Usertour.js bundle takes the queue over
// before replaying it; a stub still reachable afterwards is a method the
// bundle does not implement and must warn-and-drop, never re-enqueue. These
// tests replay the queue the way bundles older than v0.9.1 do — leftover stubs
// survive the API merge and the live array is iterated — which is where a
// re-enqueueing stub spun forever.

export {}

type Deferred = {resolve: (value?: any) => void; reject: (error: any) => void}
type QueueItem = [string, Deferred | null, any[]]

interface FakeWindow {
  usertour?: any
  USERTOURJS_QUEUE?: QueueItem[]
}

const REPLAY_CAP = 50

const loadLoader = (): FakeWindow => {
  const fakeWindow: FakeWindow = {}
  const globals = global as any
  globals.window = fakeWindow
  globals.document = {
    createElement: () => ({}),
    head: {appendChild: () => undefined, removeChild: () => undefined}
  }
  globals.navigator = {userAgent: 'Chrome/120'}
  jest.isolateModules(() => {
    require('../src/usertour')
  })
  return fakeWindow
}

// What a bundle older than v0.9.1 does on load: merge its API over the stub
// object (leftover stubs survive), take the queue, replay the live array.
const replayLikeOldBundle = (
  fakeWindow: FakeWindow,
  api: Record<string, unknown>
) => {
  const usertour = Object.assign(fakeWindow.usertour, {_stubbed: false}, api)
  fakeWindow.usertour = usertour
  const queue = fakeWindow.USERTOURJS_QUEUE as QueueItem[]
  fakeWindow.USERTOURJS_QUEUE = undefined
  let iterations = 0
  for (const [method, deferred, args] of queue) {
    if (++iterations > REPLAY_CAP) {
      break
    }
    const result = usertour[method](...args)
    if (deferred) {
      if (result instanceof Promise) {
        result.then(deferred.resolve, deferred.reject)
      } else {
        deferred.resolve(result)
      }
    }
  }
  return {queue, iterations}
}

let warn: jest.SpyInstance

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  warn.mockRestore()
  const globals = global as any
  delete globals.window
  delete globals.document
  delete globals.navigator
})

test('a call made before the bundle loads is queued', () => {
  const fakeWindow = loadLoader()
  fakeWindow.usertour.setDebug(true)
  const identified = fakeWindow.usertour.identify('u1')
  expect(identified).toBeInstanceOf(Promise)
  expect(fakeWindow.USERTOURJS_QUEUE).toEqual([
    ['setDebug', null, [true]],
    ['identify', expect.anything(), ['u1']]
  ])
  expect(warn).not.toHaveBeenCalled()
})

test('a bundle that implements the method replays it once', () => {
  const fakeWindow = loadLoader()
  fakeWindow.usertour.setDebug(true)
  const setDebug = jest.fn()
  const {queue, iterations} = replayLikeOldBundle(fakeWindow, {setDebug})
  expect(setDebug).toHaveBeenCalledWith(true)
  expect(iterations).toBe(1)
  expect(queue).toHaveLength(1)
  expect(warn).not.toHaveBeenCalled()
})

test('a leftover stub warns and drops instead of re-enqueueing itself during the replay', () => {
  const fakeWindow = loadLoader()
  fakeWindow.usertour.setDebug(true)
  // A bundle without setDebug: the loader's stub stays on the object.
  const {queue, iterations} = replayLikeOldBundle(fakeWindow, {
    init: () => undefined
  })
  expect(iterations).toBe(1)
  expect(queue).toHaveLength(1)
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toHaveBeenCalledWith(
    'usertour.js: setDebug is not supported and was ignored'
  )
})

test('a leftover promise stub rejects instead of re-enqueueing itself', async () => {
  const fakeWindow = loadLoader()
  const tracked = fakeWindow.usertour.track('signed_up')
  const {queue, iterations} = replayLikeOldBundle(fakeWindow, {
    init: () => undefined
  })
  expect(iterations).toBe(1)
  expect(queue).toHaveLength(1)
  await expect(tracked).rejects.toThrow('usertour.js: track is not supported')
  // Called again after the takeover, directly by the page: same outcome.
  await expect(fakeWindow.usertour.track('again')).rejects.toThrow(
    'not supported'
  )
  expect(fakeWindow.USERTOURJS_QUEUE).toBeUndefined()
  expect(queue).toHaveLength(1)
})

// What every bundle does when it loads and finds nothing queued: install the
// API (marking the object as no longer stubbed) and return without touching
// the queue — bundles older than v0.9.1 neither take it over nor neutralize
// leftover stubs.
const loadLikeOldBundleWithEmptyQueue = (
  fakeWindow: FakeWindow,
  api: Record<string, unknown>
) => {
  expect(fakeWindow.USERTOURJS_QUEUE).toHaveLength(0)
  fakeWindow.usertour = Object.assign(
    fakeWindow.usertour,
    {_stubbed: false},
    api
  )
}

test('after a load that found nothing queued, a method the bundle lacks is dropped rather than queued forever', () => {
  const fakeWindow = loadLoader()
  loadLikeOldBundleWithEmptyQueue(fakeWindow, {init: () => undefined})
  fakeWindow.usertour.setDebug(true)
  expect(fakeWindow.USERTOURJS_QUEUE).toHaveLength(0)
  expect(warn).toHaveBeenCalledWith(
    'usertour.js: setDebug is not supported and was ignored'
  )
})

test('after a load that found nothing queued, a promise method the bundle lacks rejects rather than pending forever', async () => {
  const fakeWindow = loadLoader()
  loadLikeOldBundleWithEmptyQueue(fakeWindow, {init: () => undefined})
  await expect(fakeWindow.usertour.track('signed_up')).rejects.toThrow(
    'not supported'
  )
  expect(fakeWindow.USERTOURJS_QUEUE).toHaveLength(0)
})

test('a method the bundle lacks, called after the takeover, is dropped rather than queued forever', () => {
  const fakeWindow = loadLoader()
  const {queue} = replayLikeOldBundle(fakeWindow, {init: () => undefined})
  fakeWindow.usertour.setDebug(true)
  expect(queue).toHaveLength(0)
  expect(warn).toHaveBeenCalledWith(
    'usertour.js: setDebug is not supported and was ignored'
  )
})
