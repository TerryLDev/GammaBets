<template>
  <LeftPanel
    :auth="user.auth"
    :userPictureURL="user.profile.ProfilePictureURL"
    :username="user.profile.Username"
  />
  <div class="main">
    <TopNav />

    <Transition name="show-deposit">
      <div
        id="popup-background-layer"
        v-if="isDepositVisible"
        @click="closeMenu"
      >
        <DepositMenu />
      </div>
    </Transition>
  </div>
</template>

<script>
import TopNav from "./components/TopNav.vue";
import LeftPanel from "./components/LeftPanel.vue";
import DepositMenu from "./components/Deposit.vue";

import { useStore } from "vuex";
import { computed } from "vue";

//import axios from "axios";

/*
import {io} from "socket.io-client"
const env = process.env.NODE_ENV;

if (env == "development") {
  socket = io("http://localhost:4000");
}

else {
  socket = io(window.location.origin);
}

socket.on("test", (data) => {
  console.log(data);
});
*/

export default {
  setup() {
    const store = useStore();

    store.dispatch("getAPIUser");

    const user = computed(() => store.state.user);

    const isDepositVisible = computed(() => store.state.deposit.isVisible);

    return {
      user,
      isDepositVisible,
    };
  },
  methods: {
    closeMenu(event) {
      if (event.path[0] == document.getElementById("popup-background-layer")) {
        this.$store.dispatch("resetDepositAll");
        this.$store.dispatch("setLoadingTrue");
      }
    },
  },
  name: "App",
  components: { TopNav, LeftPanel, DepositMenu },
};
</script>

<style>
body {
  font-family: "Montserrat", sans-serif, Arial, Helvetica;
  margin: 0;
}

/* Background color oif website */
#app {
  background: radial-gradient(
      74.05% 74.05% at 50% 16.2%,
      rgba(0, 0, 0, 0) 0%,
      rgba(14, 29, 53, 0.295) 100%
    ),
    linear-gradient(178.43deg, rgba(24, 39, 62, 0.75) 1.33%, #031303 85.13%);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  justify-content: center;
}

/* Grid Layout For All Pages */
.main {
  position: absolute;
  margin-right: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
  width: calc(100% - (20px + 20px + 20px + 350px));
  height: calc(100% - 20px);
  right: 0;
}

/* Default container cell */
.default-cell {
  box-sizing: border-box;
  box-shadow: 0px 4px 30px rgba(51, 255, 0, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 15px;
}

.default-secondary-cell {
  box-sizing: border-box;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  backdrop-filter: blur(15px);
}

.popup-cell {
  box-sizing: border-box;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

/* Primary color of cell */
.primary-color {
  background: rgba(25, 117, 62, 0.3);
}

/* Secondary color of cell */
.secondary-color {
  background: rgba(255, 255, 255, 0.25);
}

/* Accent color or Border color of cell */
.accent-color {
  outline-color: rgba(229, 239, 172, 0.5);
  outline-style: solid;
  outline-width: 2px;
  border: 0px;
}

/* Primary color for popup of cell */
.primary-color-popup {
  background: #12382a;
}

/* Secondary color for popup of cell */
.secondary-color-popup {
}

/* Format for cell Titles */
.side-menu-title {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 15px auto 15px auto;
  text-align: center;
}

/* overlays the entire website when a popup menu appears */
#popup-background {
  margin: 0;
  position: fixed;
  z-index: 3;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.25);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar-track-piece {
  background: rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar-corner {
}

.show-deposit-enter-active,
.show-deposit-leave-active {
  transition: opacity 0.3s ease;
}

.show-deposit-enter-from,
.show-deposit-leave-to {
  opacity: 0;
}

#popup-background-layer {
  display: inline;
  background-color: rgba(0, 0, 0, 0.5);
  margin: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 4;
}
</style>
