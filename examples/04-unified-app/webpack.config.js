const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const nodejsConfig = {
  target: 'node',
  externals: [nodeExternals()],
  node: {
    __dirname: false,
  },
  entry: __dirname + '/src/server.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'server.js',
    libraryTarget: 'commonjs2',
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.ts'],
  },
};

const browserConfig = {
  target: 'web',
  entry: __dirname + '/src/client.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'public/client.js',
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.ts'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'public/index.html',
      template: 'src/index.html',
    }),
  ],
}

module.exports = [nodejsConfig, browserConfig];
