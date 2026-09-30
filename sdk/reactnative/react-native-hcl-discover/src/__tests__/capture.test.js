const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

// The SDK's .js entrypoint contains TypeScript annotations and JSX.
const { outputText } = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8'),
  {
    fileName: 'index.tsx',
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }
);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it.each(['logAppContext', 'logTextChange', 'logTouch'])(
  '%s rejects when native capture fails',
  async (method) => {
    const error = Object.assign(new Error('Capture failed'), {
      code: 'E_CAPTURE_FAILED',
    });
    const capture = jest.fn().mockRejectedValue(error);
    const modules = {
      'react-native': {
        NativeModules: {
          HclDiscover: { clickclick: capture },
          I18nManager: { localeIdentifier: 'en_US' },
        },
        Platform: { OS: 'android', select: (values) => values.default },
        Dimensions: { get: () => ({ width: 200, height: 400 }) },
        StyleSheet: { create: (styles) => styles },
        findNodeHandle: () => 1,
      },
      'react-native-device-info': new Proxy(
        {},
        {
          get: (_, name) =>
            name === '__esModule'
              ? false
              : () =>
                  name === 'getDeviceId'
                    ? 'test-device'
                    : Promise.resolve('test-value'),
        }
      ),
      'react-native-sha256': { sha256: () => Promise.resolve('test-session') },
    };
    const exports = {};
    vm.runInNewContext(outputText, {
      exports,
      require: (name) => modules[name] || require(name),
      console,
      setTimeout,
      clearTimeout,
    });
    const sdk = exports.hclDiscoverReactNative;
    sdk.debugFlag = false;
    await sdk.start({ screens: { CaptureTest: { takeScreenShot: true } } });
    const event = {
      nativeEvent: {
        pageX: 1,
        pageY: 2,
        locationX: 1,
        locationY: 2,
        identifier: 0,
      },
      target: { viewConfig: { uiViewClassName: 'View' } },
      timeStamp: Date.now(),
    };
    const args = {
      logAppContext: ['CaptureTest', ''],
      logTextChange: ['masked', 'test-field'],
      logTouch: [event],
    };
    const result = sdk[method](...args[method]);
    jest.advanceTimersByTime(500);
    await expect(result).rejects.toBe(error);
    expect(capture).toHaveBeenCalledTimes(1);
  }
);
