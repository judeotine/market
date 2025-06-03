module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxRuntime: 'classic'
      }],
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
        },
      }],
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
      }]
    ]
  };
};