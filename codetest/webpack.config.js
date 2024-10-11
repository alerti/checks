const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables for the appropriate environment
const env = dotenv.config({ path: path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env') }).parsed;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'; // Determine if building for production
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'), // Use path.resolve for consistency
      filename: isProduction ? '[name].[contenthash].js' : 'index_bundle.js', // Use content hashing for production
      clean: true, // Clean the 'dist' folder before each build
    },
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'), // Serve files from 'public' folder
      },
      compress: true, // Enable gzip compression
      port: 8080,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|webp|jpeg|svg)$/,
          type: 'asset/resource', // Use asset modules for image handling
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(env),
      }),
    ],
    optimization: {
      minimize: isProduction, // Enable minification only for production
    },
    resolve: {
      extensions: ['.js', '.jsx'], // Add .jsx to resolved extensions
    },
  };
};