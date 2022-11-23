const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: 'production',
  entry: {
    main: "./src/index.js"
  },
  output: {
    filename: "js/[name].js",
    chunkFilename: "js/[name].bundle.js",
    sourceMapFilename: "js/[name].js.map",
    libraryTarget: "window",
    path: path.resolve(__dirname, "../../src/main/webapp")
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]((?!(realgrid)).*)[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        realgrid: {
          test: /[\\/]node_modules[\\/](realgrid)[\\/]/,
          name: "realgrid",
          chunks: 'all',
        },
        commons: {
          name: 'commons',
          minChunks: 1
        }
      }
    }
  },
  module: {
    rules: [
      // Babel-loader
      {
        test: /\.(js|mjs|jsx|ts|tsx)?$/,
        exclude: /node_modules\/(?!d3-zoom)/,
        loader: "babel-loader",
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".scss"],
    modules: ["node_modules"],
    alias: {
      request$: "xhr", '@zionex': path.resolve(__dirname, 'src/')
    }
  }
};
