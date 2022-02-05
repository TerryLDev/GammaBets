<template>
  <LeftPanel
    :auth="auth"
    :userPictureURL="ProfilePictureURL"
    :username="Username"
  />
  <div class="main">
    <TopNav />
  </div>
</template>

<script>
//mport { computed } from "vue";
import { useStore } from "vuex";

import TopNav from "./components/TopNav.vue";
import LeftPanel from "./components/LeftPanel.vue";
import axios from "axios";

//import axios from "axios";
/*
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("test", (data) => {
  console.log(data);
});
*/

export default {
  setup() {
    const store = useStore();

    return {
      setAuth: () => store.commit(),
    };
  },
  data() {
    return {
      auth: false,
      SteamID: "",
      Username: "",
      ProfilePictureURL: "",
      ProfileURL: "",
      Trades: [],
      TradeURL: "",
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      axios
        .get("/api/user")
        .then((res) => {
          this.auth = res.data.auth;
          this.SteamID = res.data.user.SteamID;
          this.ProfilePictureURL = res.data.user.ProfilePictureURL;
          this.Username = res.data.user.Username;
          this.ProfileURL = res.data.user.ProfileURL;
          this.Trades = res.data.user.Trades;
          this.TradeURL = res.data.user.TradeURL;
        })
        .catch((err) => console.log(err));
    },
  },
  name: "App",
  components: { TopNav, LeftPanel },
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
  border-style: solid;
  border-width: 2px;
  border-color: rgba(229, 239, 172, 0.5);
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

/* Animation for popup background */
@keyframes fadein-background {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Class for fadein background animation */
.fade-background {
  animation-name: fadein-background;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
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
</style>
