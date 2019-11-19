import '@testing-library/jest-dom/extend-expect';
import { FetchMock } from 'jest-fetch-mock';

import fetchHTML, {
  ProcessedContent,
  parseUrl,
  getUrl,
  getReplacementComments,
  processHtml,
} from '../src/index';

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

describe('parseUrl', () => {
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
});

describe('getUrl', () => {
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

describe('getReplacementComments', () => {
  test('getReplacementComments', () => {
    expect(getReplacementComments('script', 'inline')).toBe(
      '<!--script inline replaced by @ice/stark-html-->',
    );

    expect(getReplacementComments('link', 'https://g.alicdn.com/platform/common/global.css')).toBe(
      '<!--link https://g.alicdn.com/platform/common/global.css replaced by @ice/stark-html-->',
    );
  });
});

describe('processHtml', () => {
  test('processHtml', () => {
    expect(processHtml(undefined).html).toBe('');

    const { html, url, code } = processHtml(tempHTML);
    expect(html).not.toContain('<meta ');

    expect(html).not.toContain('<script src="//g.alicdn.com/p');
    expect(html).not.toContain('src="./');
    expect(html).not.toContain('src="/test.js"');
    expect(html).not.toContain('src="index.js"');

    expect(html).toContain('<link rel="dns-prefetch" href="//g.alicdn.com" />');
    expect(html).toContain('<link rel="dns-prefetch" href="//at.alicdn.com" />');
    expect(html).toContain('<link rel="dns-prefetch" href="//img.alicdn.com" />');

    expect(html).not.toContain('href="./');
    expect(html).not.toContain('href="/index.css"');
    expect(html).not.toContain('href="index.css"');

    expect(url.length).toBe(11);

    expect(code.length).toBe(2);
    expect(code[0]).not.toContain('<script');
    expect(code[0]).not.toContain('</script');
    expect(code[0]).toContain('console.log');
    expect(code[1]).toContain('window.g_config');
  });
});

describe('fetchHTML', () => {
  beforeEach(() => {
    (fetch as FetchMock).resetMocks();
  });

  const warnMockFn = jest.fn();
  (global as any).console = {
    warn: warnMockFn,
  };

  test('fetchHTML', () => {
    const fetchMockFn = jest.fn();

    const htmlUrl = '//icestark.com';
    fetchHTML(htmlUrl, fetchMockFn)
      .then(() => {
        expect(fetchMockFn).toBeCalledWith(htmlUrl);
      })
      .catch(() => {});

    fetchHTML(htmlUrl, null)
      .then(() => {
        expect(warnMockFn).toBeCalledWith(
          'Current environment does not support window.fetch, please use custom fetch',
        );
      })
      .catch(() => {});
  });

  test('fetchHTML -> success', () => {
    (fetch as FetchMock).mockResponseOnce(
      '<html>' +
        '  <head>' +
        '    <meta charset="utf-8" />' +
        '    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />' +
        '    <link rel="dns-prefetch" href="//g.alicdn.com" />' +
        '    <link rel="stylesheet" href="/index.css" />' +
        '    <link rel="stylesheet" href="index.css" />' +
        '    <title>This is for test</title>' +
        '  </head>' +
        '  <body>' +
        '    <script>' +
        '      console.log()' +
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
        '</html>',
    );

    fetchHTML('//icestark.com').then(processed => {
      expect(typeof processed).not.toBe('string');

      const { html, url, code } = processed as ProcessedContent;

      expect(html).not.toContain('<meta ');

      expect(html).not.toContain('src="//g.alicdn.com/1.1/test/index.js"');
      expect(html).not.toContain('src="/test.js"');
      expect(html).not.toContain('src="index.js"');

      expect(html).toContain('<link rel="dns-prefetch" href="//g.alicdn.com" />');
      expect(html).not.toContain('<link rel="stylesheet" href=');

      expect(html).not.toContain('href="./');
      expect(html).not.toContain('href="index.css"');
      expect(html).not.toContain('href="/index.css"');

      expect(url.length).toBe(6);

      expect(code.length).toBe(1);
    });
  });

  test('fetchHTML -> error', () => {
    const err = new Error('err');
    (fetch as FetchMock).mockRejectOnce(err);

    fetchHTML('//icestark.error.com').then(errMessage => {
      expect(warnMockFn).toBeCalledWith(errMessage);
      expect(errMessage).toBe(`fetch //icestark.error.com error: Error: err`);
    });
  });
});
