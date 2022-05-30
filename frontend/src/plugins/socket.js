import { inject } from "vue";
import { io } from "socket.io-client";

const injectionKey = Symbol("socket");

export const useSocket = () => inject(injectionKey);

const plugin = {
  install(app) {
    const socket = io(
      process.env.NODE_ENV === "production"
        ? "https://www.gammabets.com"
        : "http://localhost:4000"
    );
    app.config.globalProperties.$socket = socket;
    app.provide(injectionKey, socket);
  },
};

export default plugin;
