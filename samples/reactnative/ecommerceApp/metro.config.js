const path = require('path');
const {
  getDefaultConfig,
  mergeConfig,
} = require('@react-native/metro-config');

const projectRoot = __dirname;

const sdkRoot = path.resolve(
  projectRoot,
  '../../../sdk/reactnative/react-native-hcl-discover'
);

const config = {
  watchFolders: [sdkRoot],

  resolver: {
    extraNodeModules: {
      'react-native-hcl-discover': sdkRoot,
       react: path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
      '@babel/runtime': path.dirname(
        require.resolve('@babel/runtime/package.json', {
          paths: [projectRoot],
        })
      ),
    },
  },
};

module.exports = mergeConfig(
  getDefaultConfig(projectRoot),
  config
);