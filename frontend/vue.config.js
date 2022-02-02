module.exports = {
  devServer: {
    proxy: {
      "^/auth/steam": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "^/auth/steam/return": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "^/api": {
        target: "http://localhost:4000/api/user",
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
