var path = require('path');

module.exports = {
  entry: {
    'wingui-viewconfig': './index.js'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'window',
    path: path.resolve(__dirname, '../../src/main/webapp/js'),
    environment: {
      // The environment supports arrow functions ('() => { ... }').
      arrowFunction: false,
      // The environment supports BigInt as literal (123n).
      bigIntLiteral: false,
      // The environment supports const and let for variable declarations.
      const: false,
      // The environment supports destructuring ('{ a, b } = obj').
      destructuring: false,
      // The environment supports an async import() function to import EcmaScript modules.
      dynamicImport: false,
      // The environment supports 'for of' iteration ('for (const x of array) { ... }').
      forOf: false,
      // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
      module: false,
    }
  },
  devServer: {
    publicPath: path.join(__dirname, 'js'),
    port: 3000,
    proxy: {
      '*': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};
