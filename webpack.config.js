module.exports = {
  mode: "development",
  entry: "./test/index.js",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: "bundle.js",
  },
};
