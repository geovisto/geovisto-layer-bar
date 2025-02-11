const path = require('path');
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: 'source-map',
  entry: './src/demo/demo.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'geovisto-logimic.bundle.js',
  },
  module: {
    rules: [
        {
          test: /\.html$/,
          use: ["html-loader"]
        },
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [ "babel-loader" ]
        },
        {
            test: /\.tsx?$/,
            loader: "ts-loader"
        },
        {
            test: /\.(s?css)$/i,
            use: [
              "style-loader", // Creates `style` nodes from JS strings
              "css-loader", // Translates CSS into CommonJS
              "sass-loader", // Compiles Sass to CSS
            ],
        },
        {
            test: /\.(eot|woff|ttf|gif|png|jpe?g|svg)/,
            use: [ "file-loader" ]
        },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
  },
  /*devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },*/
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/demo/template.html"
    })
  ],
};