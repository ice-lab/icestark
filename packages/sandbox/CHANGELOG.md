# Changelog

## 1.1.3

- [fix] simply copy callable funtions's extra properties.

## 1.1.2

- [fix] hijacked eventListener were not been removed after sandbox unload. ([#295](https://github.com/ice-lab/icestark/issues/295))
- [fix] never bind `eval` in sandbox. ([#4294](https://github.com/alibaba/ice/issues/4294))
- [refact] misspelling of Sandbox types.

## 1.1.1

- [fix] falsy values except `undefined` would be trapped by proxy window. ([#156](https://github.com/ice-lab/icestark/issues/156))
## 1.1.0

- [feat] mark access to all properties added to local window by using method `getAddedProperties`.
- [feat] support injecting properties to sandbox.
