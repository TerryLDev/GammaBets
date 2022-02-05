import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import userStore from "./stores/user";

createApp(App).use(userStore).use(router).mount("#app");
