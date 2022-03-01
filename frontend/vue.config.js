const path = require("path");

module.exports = {
  publicPath: "/",
  outputDir: path.resolve(__dirname, "../backend/public"),
  devServer: {
    proxy: {
      "^/auth/steam": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: true,
      },
      "^/auth/steam/return": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: true,
      },
      "^/api/*": {
        target: "http://localhost:4000",
        secure: false,
      },
    },
  },
};
