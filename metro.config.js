const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs',
  'd.ts'
];

config.resolver.assetExts = [...config.resolver.assetExts, 'db'];
config.resolver.unstable_enablePackageExports = true;
config.resolver.nodeModulesPaths = ['node_modules'];
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

module.exports = config;