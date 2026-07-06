# Changelog

## [v0.0.23]

- The nine `@deprecated` legacy methods no longer queue their calls for the
  SDK — they warn and drop instead (`stubUnsupported`). Queueing them was the
  poison half of an infinite-loop bug: on SDK bundles that don't implement
  the method, the queue drain dispatched the entry back to the leftover
  queueing stub, which re-enqueued it from inside the drain loop — pegging
  the main thread and growing the queue until the tab ran out of memory.
  Newer bundles neutralize leftover stubs on their side too; this change
  makes the loader safe with every bundle version.

## [v0.0.21]

- Marked the legacy methods the current SDK does not implement as `@deprecated`
  (`setServerEndpoint`, `setScrollPadding`, `setInferenceAttributeNames`,
  `setInferenceAttributeFilter`, `setInferenceClassNameFilter`,
  `setCustomInputSelector`, `setSessionTimeout`, `setShadowDomEnabled`,
  `setPageTrackingDisabled`) so editors flag them at the call site. Calling
  them is ignored by the SDK (a warning is logged); the JSDoc points at the
  supported replacement where one exists.

## [v0.0.1]

- Inited the async loader for Usertour.js.
