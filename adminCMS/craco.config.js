const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  babel: {
    plugins: [
      '@babel/plugin-transform-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ],
  },
  presets: [
    '@babel/preset-env',
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ],
};
