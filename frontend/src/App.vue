<template>
<LeftPanel />
  <div class="main">
    <TopNav />
  </div>
</template>

<script>
// import axios from "axios";
import TopNav from "./components/TopNav.vue";
import LeftPanel from "./components/LeftPanel.vue"

export default {
  name: "App",
  components: { TopNav, LeftPanel },
  mounted: function () {},
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
</style>
