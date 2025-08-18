const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Enable Package Exports (set to false for compatibility)
defaultConfig.resolver.unstable_enablePackageExports = false;

// Custom resolver configuration for Firebase
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  extraNodeModules: {
    ...defaultConfig.resolver.extraNodeModules,
    '@firebase/auth': require.resolve('firebase/auth'),
    '@firebase/firestore': require.resolve('firebase/firestore'),
    '@firebase/app': require.resolve('firebase/app')
  }
};

module.exports = defaultConfig;