module.exports = {
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
