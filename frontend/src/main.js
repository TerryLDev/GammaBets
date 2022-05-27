import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores/index";
import VueObserveVisibility from "vue-observe-visibility";

createApp(App).use(store).use(router).use(VueObserveVisibility).mount("#app");