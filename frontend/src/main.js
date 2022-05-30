import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores/index";
import plugin from "./plugins/socket.js";

const app = createApp(App);
app.use(router);
app.use(store);
app.use(plugin);
app.mount("#app");
