# Changelog

## [Unreleased]

- `usertour.setDebug(enabled)` turns the SDK's console logging on or off (off by default; remembered across page loads until switched off). A call placed before the script has loaded is queued and applied on load.
- Attribute write operations are now typed as they are implemented (a server newer than v0.9.5): a value is a literal, `null` (remove), a `Date`, or exactly one operation object — `{set}`, `{set_once}`, `{add}`, `{union}`, `{remove}`; `set` / `set_once` may carry `data_type`, which pins the type of a definition being created and never retypes an existing one. `add` takes a number only. Event attributes take a literal, a `Date`, or `{set, data_type}`.
- `subtract`, `append` and `prepend` are `@deprecated`: the SDK rewrites them to `add` / `union` with a console warning.
- `identifyAnonymous`'s `opts` parameter is documented as having no effect (anonymous ids are minted client-side, so a backend can never sign one).

## [v0.0.23]

- The nine `@deprecated` legacy methods no longer queue their calls for the SDK — they warn and drop instead (`stubUnsupported`). Queueing them was the poison half of an infinite-loop bug: on SDK bundles that don't implement the method, the queue drain dispatched the entry back to the leftover queueing stub, which re-enqueued it from inside the drain loop — pegging the main thread and growing the queue until the tab ran out of memory. Newer bundles neutralize leftover stubs on their side too; this change makes the loader safe with every bundle version.

## [v0.0.21]

- Marked the legacy methods the current SDK does not implement as `@deprecated` (`setServerEndpoint`, `setScrollPadding`, `setInferenceAttributeNames`, `setInferenceAttributeFilter`, `setInferenceClassNameFilter`, `setCustomInputSelector`, `setSessionTimeout`, `setShadowDomEnabled`, `setPageTrackingDisabled`) so editors flag them at the call site. Calling them is ignored by the SDK (a warning is logged); the JSDoc points at the supported replacement where one exists.

## [v0.0.1]

- Inited the async loader for Usertour.js.
