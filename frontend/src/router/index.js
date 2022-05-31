import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import LowStakes from "../views/LowStakes.vue";
import Coinflip from "../views/Coinflip.vue";
import Trading from "../views/Trade.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/lowstakes",
    name: "Low Stakes",
    component: LowStakes,
  },
  {
    path: "/coinflip",
    name: "Coinflip",
    component: Coinflip,
  },
  {
    path: "/trading",
    name: "Trading",
    component: Trading,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
