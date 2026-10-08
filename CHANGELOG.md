# Changelog

## [Unreleased]

- On Usertour.js newer than v0.9.5 (Cloud always serves the newest bundle; self-hosted, it is the bundle your server serves), `identify`, `identifyAnonymous`, `updateUser`, `group` and `updateGroup` resolve to `{ rejected }` (`AttributesWriteResult`): the attributes the server refused, each with a reason — a value that does not fit the attribute's type, or a system-generated attribute such as a Random A/B or Random number attribute. Every other attribute was written; the SDK also logs a warning per refused attribute. A call queued before the SDK loads resolves to the same result. An older bundle still resolves these calls with `undefined`, so destructure the result only once your server runs a version newer than v0.9.5.
- `usertour.setDebug(enabled)` turns the SDK's console logging on or off (off by default; remembered across page loads until switched off). A call placed before the script has loaded is queued and applied on load.
- Attribute write operations are now typed as they are implemented (a server newer than v0.9.5): a value is a literal, `null` (remove), a `Date`, or exactly one operation object — `{set}`, `{set_once}`, `{add}`, `{union}`, `{remove}`; `set` / `set_once` may carry `data_type`, which pins the type of a definition being created and never retypes an existing one. `add` takes a number only. Event attributes take a literal, a `Date`, or `{set, data_type}`. Compile-time break: a numeric string passed to `add` or `subtract` (`{ add: '5' }`) no longer type-checks; at runtime the SDK still coerces it.
- `subtract`, `append` and `prepend` are `@deprecated`: the SDK rewrites them to `add` / `union` with a console warning. They are exactly-one operations like the rest — `{}` and an object carrying two of them no longer type-check (the server rejected both already).
- A queued stub enqueues only while no Usertour.js bundle has loaded. Every bundle marks `window.usertour` as loaded when it installs its API and takes the queue over before replaying it, so a stub still reachable afterwards is a method the loaded bundle does not implement: it now warns and drops the call (a promise-returning one rejects) instead of enqueueing it — whether that happens inside the replay or later, after a load that found nothing queued. This closes the infinite-loop path for `setDebug` — and any method newer than the bundle — on bundles older than v0.9.1, which keep leftover stubs and replay the live array; v0.0.23 had closed it only for the nine deprecated methods.
- `identifyAnonymous`'s `opts` parameter is documented as having no effect (anonymous ids are minted client-side, so a backend can never sign one).

## [v0.0.23]

- The nine `@deprecated` legacy methods no longer queue their calls for the SDK — they warn and drop instead (`stubUnsupported`). Queueing them was the poison half of an infinite-loop bug: on SDK bundles that don't implement the method, the queue drain dispatched the entry back to the leftover queueing stub, which re-enqueued it from inside the drain loop — pegging the main thread and growing the queue until the tab ran out of memory. Newer bundles neutralize leftover stubs on their side too; this change makes the loader safe with every bundle version.

## [v0.0.21]

- Marked the legacy methods the current SDK does not implement as `@deprecated` (`setServerEndpoint`, `setScrollPadding`, `setInferenceAttributeNames`, `setInferenceAttributeFilter`, `setInferenceClassNameFilter`, `setCustomInputSelector`, `setSessionTimeout`, `setShadowDomEnabled`, `setPageTrackingDisabled`) so editors flag them at the call site. Calling them is ignored by the SDK (a warning is logged); the JSDoc points at the supported replacement where one exists.

## [v0.0.1]

- Inited the async loader for Usertour.js.
