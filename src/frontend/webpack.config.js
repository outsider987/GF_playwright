const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
require('dotenv').config();
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'app.tsx'),
  // watch: true,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    chunkFilename: '[chunkhash].js',
    sourceMapFilename: 'js/[file].map',
    clean: true,
    assetModuleFilename: '[path][name].[hash][ext][query]',
    // publicPath: '/webpack-demo/'
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
          //   'style-loader'
        ],
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[path][name].[hash][ext][query]',
        },
      },

      //   { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(ts|tsx)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        },
      },
      {
        // this should be /\.handlebars$/
        test: /\.hbs$/,
        exclude: /(node_modules)/,
        loader: 'handlebars-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '~': path.resolve(__dirname, 'src/'),
    },
    // fallback: {
    //         "fs": false,
    //         "os": require.resolve("os-browserify/browser")
    //     },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new CleanWebpackPlugin({
      verbose: true,
    }),

    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
    // new BundleAnalyzerPlugin({
    //     "openAnalyzer": false,analyzerMode: 'static'
    // }),
    new HtmlWebpackPlugin({
      test: /\.(html|png|svg)$/,
      template: path.resolve(__dirname, 'src', 'public', 'index.html'),
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css',
    }),
  ],
  devtool: 'source-map',

  devServer: {
    static: {
      directory: path.resolve(__dirname, './dist'),
    },
    allowedHosts: 'all',
    compress: true,
    hot: true,
    historyApiFallback: { index: '/', disableDotRule: true },
    // static: path.join(__dirname, 'dist'),
    open: true,
    port: 8080,
    compress: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 5000,
      // minRemainingSize: 0, (Webpack 5 才有此選項)
      maxSize: 25000,
      minChunks: 1,
      maxAsyncRequests: 6,
      maxInitialRequests: 4,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          chunks: 'initial',
          name: 'vendors',
          priority: 20,
          enforce: true,
        },
        // 抽離公用模組
        common: {
          chunks: 'initial',
          minSize: 0,
          name: 'common',
          minChunks: 2,
          priority: 10,
        },
      },
    },
  },
};
