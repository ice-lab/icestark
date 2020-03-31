import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';
import {
  getEntryAssets,
  appendAssets,
  appendCSS,
  emptyAssets,
  recordAssets,
  AssetTypeEnum,
  AssetCommentEnum,
  parseUrl,
  getUrl,
  getComment,
  processHtml,
  appendExternalScript,
  getUrlAssets,
} from '../src/util/handleAssets';
import { setCache } from '../src/util/cache';

const tempHTML =
  '<!DOCTYPE html>' +
  '<html>' +
  '  <head>' +
  '    <meta charset="utf-8" />' +
  '    <meta name="data-spm" content="181" />' +
  '    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' +
  '    <meta name="renderer" content="webkit" />' +
  '    <meta name="format-detection" content="telephone=no" />' +
  '    <meta name="format-detection" content="email=no" />' +
  '    <meta http-equiv="cleartype" content="on" />' +
  '    <link rel="dns-prefetch" href="//g.alicdn.com" />' +
  '    <link rel="dns-prefetch" href="//at.alicdn.com" />' +
  '    <link rel="dns-prefetch" href="//img.alicdn.com" />' +
  '    <link rel="stylesheet" href="./test.css" />' +
  '    <link rel="stylesheet" href="/index.css" />' +
  '    <title>This is for test</title>' +
  '    <!--[if lte IE 9]>' +
  '      <script src="//g.alicdn.com/platform/c/??es5-shim/4.1.12/es5-shim.min.js,es5-shim/4.1.12/es5-sham.min.js,console-polyfill/0.2.1/index.min.js"></script>' +
  '    <![endif]-->' +
  '    <!-- 基础样式包 -->' +
  '    <link rel="stylesheet" href="https://g.alicdn.com/platform/common/global.css" />' +
  '    <!-- 组件依赖配置 css -->' +
  '    <!-- <link rel="stylesheet" id="" href="/1.0.8/web.css?t=1f"> -->' +
  '  </head>' +
  '  <body class="zh-cn">' +
  '    <script>' +
  '      console.log()' +
  '    </script>' +
  '    <script' +
  '      async' +
  '      src="//g.alicdn.com/1.1/test/index.js"' +
  '      id="ice-test"' +
  '    ></script>' +
  '    <div id="App">' +
  '      <style>' +
  '        .preview-page-loading {' +
  '          width: 48px;' +
  '          height: 48px;' +
  '        }' +
  '        /* IE9+ CSS HACK */' +
  '        @media screen and (min-width: 0//0) and (-webkit-min-device-pixel-ratio: 0.75),' +
  '          screen and (min-width: 0//0) and (min-resolution: 72dpi) {' +
  '          .preview-page-loading {' +
  '            background-image: url(https://g.alicdn.com/uxcore/pic/loading-s.gif);' +
  '          }' +
  '        }' +
  '      </style>' +
  '      <div class="preview-page-loading"></div>' +
  '    </div>' +
  '    <script crossorigin="anonymous" src="/test.js"></script>' +
  '    <script' +
  '      crossorigin="anonymous"' +
  '      src="//g.alicdn.com/platform/c/??react/16.5.2/react.min.js,react-dom/16.5.2/react-dom.min.js,react15-polyfill/0.0.1/dist/index.js"' +
  '    ></script>' +
  '    <!-- 页面配置 -->' +
  '    <script>' +
  '      window.g_config = {' +
  "        testKey: '__id'," +
  '      };' +
  '      window.testConfig = {' +
  "        testEnv: 'prod'," +
  '      };' +
  '    </script>' +
  '    <!-- 引入RE资源 -->' +
  '    <script' +
  '      crossorigin="anonymous"' +
  '      src="//g.alicdn.com/test.min.js"' +
  '    ></script>' +
  '    <!-- 组件依赖 & 页面入口 -->' +
  '    <!-- <script crossorigin="anonymous" src="./test/1.0.8/web.js?t=1f"></script> -->' +
  '    <script src="index.js"></script>' +
  '    <div id="page_bottom"></div>' +
  '  </body>' +
  '</html>';

describe('getComment', () => {
  test('getComment', () => {
    expect(getComment('script', 'inline', AssetCommentEnum.REPLACED)).toBe(
      '<!--script inline replaced by @ice/stark-->',
    );

    expect(
      getComment(
        'link',
        'https://g.alicdn.com/platform/common/global.css',
        AssetCommentEnum.REPLACED,
      ),
    ).toBe('<!--link https://g.alicdn.com/platform/common/global.css replaced by @ice/stark-->');

    expect(getComment('link', '/test.css', AssetCommentEnum.PROCESSED)).toBe(
      '<!--link /test.css processed by @ice/stark-->',
    );
  });
});

describe('processHtml', () => {
  test('processHtml', () => {
    expect(processHtml(undefined).html).toBe('');

    const { html, assets: {jsList, cssList} } = processHtml(tempHTML);

    expect(html).not.toContain('<script src="//g.alicdn.com/p');
    expect(html).not.toContain('src="./');
    expect(html).not.toContain('src="/test.js"');
    expect(html).not.toContain('src="index.js"');

    expect(html).toContain('<link rel="dns-prefetch" href="//g.alicdn.com" />');
    expect(html).toContain('<link rel="dns-prefetch" href="//at.alicdn.com" />');
    expect(html).toContain('<link rel="dns-prefetch" href="//img.alicdn.com" />');

    expect(html).toContain('<!--link ./test.css processed by @ice/stark-->');
    expect(html).toContain('<!--link /index.css processed by @ice/stark-->');
    expect(html).not.toContain('href="/index.css"');
    expect(html).not.toContain('href="index.css"');

    expect(jsList.length).toBe(7);
    expect(cssList.length).toBe(4);

    // script external assets
    expect(jsList[1].type).toBe(AssetTypeEnum.EXTERNAL);
    expect(jsList[1].content).not.toContain('<script');
    expect(jsList[1].content).not.toContain('</script');
    expect(jsList[1].content).toContain('//g.alicdn.com/1.1/test/index.js');
    expect(jsList[2].type).toBe(AssetTypeEnum.EXTERNAL);
    expect(jsList[2].content).toContain('/test.js');
    expect(jsList[5].type).toBe(AssetTypeEnum.EXTERNAL);
    expect(jsList[5].content).toContain('//g.alicdn.com/test.min.js');


    // script inline assets
    expect(jsList[0].type).toBe(AssetTypeEnum.INLINE);
    expect(jsList[0].content).toContain('console.log()');
    expect(jsList[4].type).toBe(AssetTypeEnum.INLINE);
    expect(jsList[4].content).toContain('window.g_config');

  });
});

describe('appendExternalScript', () => {
  test('appendExternalScript -> inline', () => {
    const div = document.createElement('div');

    expect.assertions(1);
    return expect(
      appendExternalScript(div, { type: AssetTypeEnum.INLINE, content: 'console.log()' }, 'js-id'),
    ).resolves.toBeUndefined();
  });

  test('appendExternalScript -> url', () => {
    const div = document.createElement('div');

    appendExternalScript(div, '/test.js', 'js-id')
      .then(() => expect(div.innerHTML).toContain('/test.js'))
      .catch(() => {});
    const scripts = div.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      scripts[i].dispatchEvent(new Event('load'));
    }
  });

  test('appendExternalScript -> EXTERNAL success', () => {
    const div = document.createElement('div');

    appendExternalScript(div, { type: AssetTypeEnum.EXTERNAL, content: '/test.js' }, 'js-id')
      .then(() => expect(div.innerHTML).toContain('/test.js'))
      .catch(() => {});

    const scripts = div.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      scripts[i].dispatchEvent(new Event('load'));
    }
  });

  test('appendExternalScript -> EXTERNAL error', () => {
    const div = document.createElement('div');

    appendExternalScript(div, { type: AssetTypeEnum.EXTERNAL, content: '/test.js' }, 'js-id').catch(err =>
      expect(err.message).toContain('js asset loaded error: '),
    );

    const scripts = div.getElementsByTagName('script');
    scripts[0].dispatchEvent(new ErrorEvent('error'));
  });
});

describe('getEntryAssets', () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  const warnMockFn = jest.fn();
  (global as any).console = {
    warn: warnMockFn,
  };

  test('getEntryAssets innerHTML', () => {
    const fetchMockFn = jest.fn();

    const div = document.createElement('div');
    const htmlUrl = '//icestark.com';
    getEntryAssets({
      root: div,
      entry: htmlUrl,
      assetsCacheKey: '/test',
      fetch: (url) => (
        new Promise(resolve => {
          resolve(fetchMockFn(url));
        })
      ),
    })
      .then(() => {
        expect(fetchMockFn).toBeCalledWith(htmlUrl);
      })
      .catch(() => {});

    getEntryAssets({
      root: div,
      entry: htmlUrl,
      assetsCacheKey: '/test',
    })
      .then(() => {
        expect(warnMockFn).toBeCalledWith(
          'Current environment does not support window.fetch, please use custom fetch',
        );
      })
      .catch(() => {});
  });

  test('getEntryAssets -> success', async () => {
    const htmlContent =
      '<html>' +
      '  <head>' +
      '    <meta charset="utf-8" />' +
      '    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' +
      '    <link rel="dns-prefetch" href="//g.alicdn.com" />' +
      '    <link rel="stylesheet" href="/index.css" />' +
      '    <link rel="stylesheet" href="test.css" />' +
      '    <title>This is for test</title>' +
      '  </head>' +
      '  <body>' +
      '    <script>' +
      '      console.log()' +
      '      console.log(1 > 2);console.log(1 < 2)' +
      '    </script>' +
      '    <script' +
      '      async' +
      '      src="//g.alicdn.com/1.1/test/index.js"' +
      '      id="ice-test"' +
      '    ></script>' +
      '    <div id="App">' +
      '    </div>' +
      '    <script crossorigin="anonymous" src="/test.js"></script>' +
      '    <script' +
      '      crossorigin="anonymous"' +
      '      src="/test.min.js"' +
      '    ></script>' +
      '    <script src="index.js"></script>' +
      '    <div id="page_bottom"></div>' +
      '  </body>' +
      '</html>';

    (fetch as FetchMock).mockResponseOnce(htmlContent);

    const div = document.createElement('div');

    const assets = await getEntryAssets({
      root: div,
      entry: '//icestark.com',
      assetsCacheKey: '/test',
    });
    
    expect(assets).toStrictEqual({
      cssList: [
        {
          content: 'http://icestark.com/index.css',
          type: AssetTypeEnum.EXTERNAL,
        },
        {
          content: 'http://icestark.com/test.css',
          type: AssetTypeEnum.EXTERNAL,
        },
      ],
      jsList: [
        {
          content: '      console.log()      console.log(1 > 2);console.log(1 < 2)    ',
          type: AssetTypeEnum.INLINE,
        },
        {
          content: '//g.alicdn.com/1.1/test/index.js',
          type: AssetTypeEnum.EXTERNAL,
        },
        {
          content: 'http://icestark.com/test.js',
          type: AssetTypeEnum.EXTERNAL,
        },
        {
          content: 'http://icestark.com/test.min.js',
          type: AssetTypeEnum.EXTERNAL,
        },
        {
          content: 'http://icestark.com/index.js',
          type: AssetTypeEnum.EXTERNAL,
        },
      ],
    });
    const html = div.innerHTML;

    expect(html).not.toContain('src="//g.alicdn.com/1.1/test/index.js"');
    expect(html).not.toContain('src="/test.js"');
    expect(html).not.toContain('src="index.js"');

    expect(html).toContain('<!--script /test.js replaced by @ice/stark-->');
    expect(html).toContain('<!--script index.js replaced by @ice/stark-->');

    expect(html).toContain('href="//g.alicdn.com"');
    expect(html).not.toContain('<link rel="stylesheet" href="/index.css');
    expect(html).not.toContain('<link rel="stylesheet" href="test.css');

    expect(html).toContain('<!--link /index.css processed by @ice/stark-->');
    expect(html).toContain('<!--link test.css processed by @ice/stark-->');

    const scripts = div.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      scripts[i].dispatchEvent(new Event('load'));
    }
  });

  test('getEntryAssets -> error', () => {
    const err = new Error('err');
    (fetch as FetchMock).mockRejectOnce(err);

    const div = document.createElement('div');

    getEntryAssets({
      root: div,
      entry: '//icestark.error.com',
      assetsCacheKey: '/test',
    }).catch(() => {});
  });
});

// tests for url
describe('appendAssets', () => {
  test('appendAssets basic', () => {
    emptyAssets(() => true, true);
    const assets = getUrlAssets([
      'http://icestark.com/js/index.js',
      'http://icestark.com/css/index.css',
      'http://icestark.com/js/test1.js',
    ]);
    appendAssets(
      assets,
    ).then(() => {
      const jsElement0 = document.getElementById('icestark-js-0');
      const jsElement1 = document.getElementById('icestark-js-1');

      expect((jsElement0 as HTMLScriptElement).src).toEqual('http://icestark.com/js/index.js');
      expect((jsElement0 as HTMLScriptElement).async).toEqual(false);
      expect((jsElement1 as HTMLScriptElement).src).toEqual('http://icestark.com/js/test1.js');
      expect((jsElement1 as HTMLScriptElement).async).toEqual(false);
      expect(jsElement0.getAttribute('icestark')).toEqual('dynamic');
      expect(jsElement1.getAttribute('icestark')).toEqual('dynamic');

      recordAssets();

      expect(jsElement0.getAttribute('icestark')).toEqual('dynamic');
      expect(jsElement1.getAttribute('icestark')).toEqual('dynamic');

      emptyAssets(() => true, true);
    });
  });

  test('appendAssets useShadow=true', () => {
    setCache('root', document.getElementsByTagName('head')[0]);
    const assets = getUrlAssets([
      'http://icestark.com/js/index.js',
      'http://icestark.com/css/index.css',
      'http://icestark.com/js/test1.js',
    ]);
    appendAssets(
      assets,
    );
  });

  test('recordAssets', () => {
    const jsElement = document.createElement('script');
    jsElement.id = 'icestark-script';

    const linkElement = document.createElement('link');
    linkElement.id = 'icestark-link';

    const styleElement = document.createElement('style');
    styleElement.id = 'icestark-style';

    document.body.appendChild(jsElement);
    document.body.appendChild(linkElement);
    document.body.appendChild(styleElement);

    recordAssets();

    expect(jsElement.getAttribute('icestark')).toEqual('static');
    expect(linkElement.getAttribute('icestark')).toEqual('static');
    expect(styleElement.getAttribute('icestark')).toEqual('static');
  });

  test('parseUrl', () => {
    let parsedUrl = parseUrl('http://localhost:4444/seller/detail');
    expect(parsedUrl.origin).toBe('http://localhost:4444');
    expect(parsedUrl.pathname).toBe('/seller/detail');

    parsedUrl = parseUrl('//localhost:4444/seller/detail');
    expect(parsedUrl.origin).toBe('http://localhost:4444');
    expect(parsedUrl.pathname).toBe('/seller/detail');

    parsedUrl = parseUrl('https://github.com/ice-lab/icestark');
    expect(parsedUrl.origin).toBe('https://github.com');
    expect(parsedUrl.pathname).toBe('/ice-lab/icestark');
  });

  test('getUrl', () => {
    // for ./*
    expect(getUrl('https://icestark.com/ice/index.html', './js/index.js')).toBe(
      'https://icestark.com/ice/js/index.js',
    );
    expect(getUrl('https://icestark.com/', './js/index.js')).toBe(
      'https://icestark.com/js/index.js',
    );
    expect(getUrl('https://icestark.com', './js/index.js')).toBe(
      'https://icestark.com/js/index.js',
    );

    // for /*
    expect(getUrl('https://icestark.com/', '/js/index.js')).toBe(
      'https://icestark.com/js/index.js',
    );
    expect(getUrl('https://icestark.com', '/js/index.js')).toBe('https://icestark.com/js/index.js');

    // for *
    expect(getUrl('https://icestark.com', 'js/index.js')).toBe('https://icestark.com/js/index.js');
  });
});

describe('appendCSS', () => {
  test('appendLink -> success', () => {
    const div = document.createElement('div');

    appendCSS(div, '/test.css', 'icestark-css-0')
      .then(() => {
        expect(div.innerHTML).toContain('id="icestark-css-0"');
        expect(div.innerHTML).toContain('/test.css');
      })
      .catch(() => {});

    const links = div.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      links[i].dispatchEvent(new Event('load'));
    }
  });

  test('appendCSS -> style', () => {
    const div = document.createElement('div');
    const style = '.test { color: #fff;}';
    appendCSS(div, {
      type: AssetTypeEnum.INLINE,
      content: style,
    }, 'icestark-css-0')
      .then(() => {
        expect(div.innerHTML).toContain('id="icestark-css-0"');
        expect(div.innerHTML).toContain(style);
      })
      .catch(() => {});

    const styles = div.getElementsByTagName('style');
    expect(styles[0].innerHTML).toBe(style);
  });

  test('appendLink -> error', () => {
    const errorMockFn = jest.fn();
    (global as any).console = {
      error: errorMockFn,
    };

    const div = document.createElement('div');

    appendCSS(div, '/test.css', 'icestark-css-0')
      .then(() => {
        expect(div.innerHTML).toContain('id="icestark-css-0"');
        expect(div.innerHTML).toContain('/test.css');
        expect(errorMockFn).toBeCalledTimes(1);
        expect(errorMockFn).toBeCalledWith('css asset loaded error: /test.css');
      })
      .catch(() => {});

    const links = div.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      links[i].dispatchEvent(new ErrorEvent('error'));
    }
  });
});
