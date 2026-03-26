const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = Object.assign({}, config.resolver.extraNodeModules, {
  'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js')
});

module.exports = config;
