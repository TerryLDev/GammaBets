import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores/index";

createApp(App).use(store).use(router).mount("#app");
