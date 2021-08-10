# Changelog

See [https://github.com/ice-lab/icestark/releases](https://github.com/ice-lab/icestark/releases) for what has changed in each version of icestark.

## 2.5.0

- [feat] `path` is deprecated and using the more powerful `activePath` instaed. ([#299, #297, #209](https://github.com/ice-lab/icestark/issues/299))
- [feat] debug mirco-frontends are accessiable by using source maps, even in sandbox. ([#259](https://github.com/ice-lab/icestark/issues/259))
- [fix] call callCapturedEventListeners later to prevent double Prompt. ([#325](https://github.com/ice-lab/icestark/issues/325))
- [refact] refactor url-matching algorithm.


## 2.4.0

- [feat] support appending extra attributes for scripts when using `loadScriptMode = script`. ([#276](https://github.com/ice-lab/icestark/issues/276))
- [fix] unexpectable sandbox's cleaning up when load modules. ([#293](https://github.com/ice-lab/icestark/issues/293))
- [fix] missing `ErrorComponent` causes React rendering's error. ([#312](https://github.com/ice-lab/icestark/issues/312))

## 2.3.2

- [refact] compatible with sandbox spell error.

## 2.3.1

- [fix] parse `library` the right way if `library` is an array. ([#287](https://github.com/ice-lab/icestark/issues/287))

## 2.3.0

- [feat] support `prefetch` sub-application, which let your micro application fly. ([#188](https://github.com/ice-lab/icestark/issues/188))

## 2.2.2

- [fix] `basename` of `AppRouter` makes effect. ([#241](https://github.com/ice-lab/icestark/issues/241))
- [fix] alter baseURI when using `DOMParser`. ([#233](https://github.com/ice-lab/icestark/issues/233), [#4040](https://github.com/alibaba/ice/issues/4040))

## 2.2.1

- [fix] css assets are unable to load when remove `umd` from sub-application.
## 2.2.0

- [feat] no need to use `umd` anymore. Migrate to `loadScriptMode` or use `setLibraryName` in sub-application. ([#240](https://github.com/ice-lab/icestark/issues/240))
