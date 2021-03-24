# Changelog

See [https://github.com/ice-lab/icestark/releases](https://github.com/ice-lab/icestark/releases) for what has changed in each version of icestark.

## 2.3.0

- [feat] support `prefetch` sub-application, which let your micro application fly. ([#188](https://github.com/ice-lab/icestark/issues/188))

## 2.2.2

- [fix] `basename` of `AppRouter` makes effect. ([#241](https://github.com/ice-lab/icestark/issues/241))
- [fix] alter baseURI when using `DOMParser`. ([#233](https://github.com/ice-lab/icestark/issues/233), [#4040](https://github.com/alibaba/ice/issues/4040))

## 2.2.1

- [fix] css assets are unable to load when remove `umd` from sub-application.
## 2.2.0

- [feat] no need to use `umd` anymore. Migrate to `loadScriptMode` or use `setLibraryName` in sub-application. ([#240](https://github.com/ice-lab/icestark/issues/240))
