# icestark

> Icestark is a JavaScript library for multiple react projects, Ice workbench solution.

[![NPM version](https://img.shields.io/npm/v/icestark.svg?style=flat)](https://npmjs.org/package/icestark)
[![Package Quality](https://npm.packagequality.com/shield/icestark.svg)](https://packagequality.com/#?package=icestark)
[![build status](https://img.shields.io/travis/ice-lab/icestark.svg?style=flat-square)](https://travis-ci.org/ice-lab/icestark)
[![Test coverage](https://img.shields.io/codecov/c/github/ice-lab/icestark.svg?style=flat-square)](https://codecov.io/gh/ice-lab/icestark)
[![NPM downloads](http://img.shields.io/npm/dm/icestark.svg?style=flat)](https://npmjs.org/package/icestark)
[![David deps](https://img.shields.io/david/ice-lab/icestark.svg?style=flat-square)](https://david-dm.org/ice-lab/icestark)

## Installation

```bash
npm install icestark --save
```

## Run Demo

Run child：
```bash
cd demo/child
npm install
npm start
```

Run child2
```bash
cd demo/child2
npm install
npm start
```

Run layout：
```bash
cd demo/layout
npm install
npm start
```

Open up http://localhost:3333 in a web browser

## Example

```javascript
class Layout extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <AppLoader
          env="local"
          apps={apps}
          getBundleUrl={({ repo, version, localPort, localIp, env, type }) => {
            if (env === 'local') {
              return `//${localIp}:${localPort}/${type}/index.${type}`;
            }
            const cdnHost = env === 'production' ? 'production.com' : 'daily.com';
            return `//${cdnHost}/${repo}/${version}/${type}/index.${type}`;
          }}
          NotFoundComponent={NotFound}
          onRouteChange={this.onRouteChange}
        />
        <Footer />
      </div>
    );
  }
}
```

## Configuration

|        Property        |                               Description                               |        Type        |   Default    |
| :--------------------: | :---------------------------------------------------------------------: | :----------------: | :----------: |
|          env           | bundle environment, can be set to `local` `daily` `prepub` `production` |       string       | `production` |
|          apps          |  app configuration includes `localPort`, `basePath`, `title` and so on  |       array        |      []      |
|      getBundleUrl      |            transform current app configuration to bundleUrl             |      function      |     noop     |
|     onRouteChange      |                  callback executed when route changed                   |      function      |     noop     |
|   NotFoundComponent    |                   render when the route changed error                   | function/ReactNode |              |
|  BundleErrorComponent  |                  render when the bundle pulls an error                  | function/ReactNode |              |
| BundleLoadingComponent |                      render when Bundle is Loading                      | function/ReactNode |              |
|       shadowRoot       |                        whether to use shadowRoot                        |        bool        |     true     |



