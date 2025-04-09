# Changelog

See [https://github.com/ice-lab/icestark/releases](https://github.com/ice-lab/icestark/releases) for what has changed in each version of icestark.

# 2.8.1

- [fix] support unique cache keys for JavaScript resources.

## 2.8.0

- [feat] support `runtime` option to reuse the UMD library.

## 2.7.5

- [fix] avoid to set undefined url when state change.

## 2.7.4

- [feat] support custom `AppRoute` location by component props.

## 2.7.3

- [fix] empty value or `undefined` in `activePath` array will be ignored. ([#558](https://github.com/ice-lab/icestark/issues/558))
- [fix] append missing styles in vite developing mode. ([#555](https://github.com/ice-lab/icestark/issues/555))

## 2.7.2

- [fix] set actual basename when `activePath` is an array. ([#526](https://github.com/ice-lab/icestark/issues/526))

## 2.7.1

- [feat] improve DX a lot.

## 2.7.0

- [feat] cache css by default. ([#373](https://github.com/ice-lab/icestark/issues/373))
- [feat] appHistory and <Link /> can both take state. ([#477](https://github.com/ice-lab/icestark/issues/477))
- [chore] narrow scope of `import`'s error. ([#466](https://github.com/ice-lab/icestark/issues/466))
- [chore] add missing props for lifecycles. ([#440](https://github.com/ice-lab/icestark/issues/440))

## 2.6.2

- [fix] avoid to append duplicate assets. ([#331](https://github.com/ice-lab/icestark/issues/331))
- [fix] bind `pushState` to global. ([#426](https://github.com/ice-lab/icestark/issues/426))
- [fix] prefetch apps using `window.fetch` by default.

## 2.6.1

- [fix] wrap `import` using `new Function` to avoid compiler error under chrome61 & ie. ([#404](https://github.com/ice-lab/icestark/issues/404))

## 2.6.0

- [feat] support native es module micro-applications. ([#346, #260](https://github.com/ice-lab/icestark/issues/346))
- [feat] handle `<base />` element and re-execute DOM Parser to enable `<app-root></app-root>` of Angular.([#368](https://github.com/ice-lab/icestark/pull/368))
- [refact] change `module: commonjs` to `module: esnext`.
- [fix] assign to `location.hash` never trigger `onRouteChange` twice. ([#353](https://github.com/ice-lab/icestark/issues/353))

## 2.5.3

- [fix] `setBasename` before `createMicroApp` may be covered for empty activePath.

## 2.5.2

- [fix] `createMicroApp` without `activePath` cause error.

## 2.5.1

- [hotfix] keep the misunderstanding `basename=''` working fine with `<AppRoute />`.

## 2.5.0

- [feat] `path` is deprecated and using the more powerful `activePath` instead. ([#299, #297, #209](https://github.com/ice-lab/icestark/issues/299))
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
