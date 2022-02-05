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
      "^/api/user": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
      "^/api/jackpot/highstakes": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
