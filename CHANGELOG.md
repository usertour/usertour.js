# Changelog

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
