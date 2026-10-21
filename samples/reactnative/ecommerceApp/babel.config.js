module.exports = {
  presets: ['module:@react-native/babel-preset'],
    plugins: [
    require.resolve(
      'react-native-hcl-discover/babel-plugin-hcl-discover-text-input'
    ),
  ],
};
