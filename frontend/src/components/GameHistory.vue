<template>
  <div id="history" class="primary-color default-cell accent-color">
    <h3 class="side-menu-title">{{ historyTitle }} History</h3>
    <Transition>
      <div v-if="isCF" id="history-div">
        <CFHistoryTop :topGame="cfHistory.topGame" />
        <div
          id="recent-history"
          v-for="histObj in cfHistory.history"
          :key="histObj.gameID"
        >
          <CFHistoryTile :historyObject="histObj" />
          <div class="tile-line-break"></div>
        </div>
      </div>
      <HsHistory v-else-if="isHS"/>
      <h1 v-else>KILL ME</h1>
    </Transition>
  </div>
</template>

<script>
import axios from "axios";

import CFHistoryTile from "./history/CFHistoryTile.vue";
import CFHistoryTop from "./history/CFHistoryTop.vue";
import HsHistory from "./history/HsHistory.vue";

export default {
  props: { historyTitle: String },
  data() {
    return {
      cfHistory: {},
      isCF: false,
      isHS: false,
      isLS: false,
    };
  },
  methods: {
    checkHistoryTitle() {
      const title = this.historyTitle.toLowerCase();
      if (title == "coinflip") {
        return "cf";
      } else if (title == "high stakes") {
        this.isHS = true;
        return "hs";
      }
    },
    getCFHistory() {
      axios
        .post("api/coinflip/history")
        .then((res) => {
          this.$store.dispatch("setCoinflipHistory", res.data);
          this.cfHistory = res.data;
          this.isCF = true;
        })
        .catch((err) => {
          return console.error(err);
        });
    },
  },
  beforeMount() {
    const historyType = this.checkHistoryTitle();

    if (historyType == "cf") {
      this.getCFHistory();
    }
  },
  components: {
    CFHistoryTile,
    CFHistoryTop,
    HsHistory
  },
  name: "GameHistory",
};
</script>

<style>
#history {
  width: 350px;
  height: calc(100% - (20px + 60px + 20px + 250px + 20px));
  float: right;
  margin-top: 20px;
  margin-left: 20px;
  display: block;
  padding: 0px 10px 15px;
  overflow-y: scroll;
}

#history-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  width: 100%;
}

#history-top {
  margin: 0 0 10px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.top-history-img {
  width: 100px;
  height: 100px;
  border-radius: 10px;
}

#recent-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  width: 100%;
}

.top-history-title {
  margin: 10px 0px 15px 0px;
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 18px;
  color: #00ff19;
}

.top-history-info {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
  color: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.top-history-info p {
  margin: 0;
  padding: 0;
}

.tile-line-break {
  border-top: 2px solid rgba(229, 239, 172, 0.5);
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0px 0px 10px;
}

.history-tile {
  display: grid;
  width: 100%;
  grid-template: 75px / 75px 1fr;
  grid-template-rows: 75px;
  margin-bottom: 10px;
}

.history-tile img {
  margin: 0;
  width: 75px;
  height: 75px;
  border-radius: 10px;
  grid-area: 1 / 1 / span 1 / span 1;
}

.history-tile-left {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  padding-left: 10px;
}

.history-tile-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  width: 100%;
}

.history-tile-info p {
  font-family: "Montserrat";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
  color: #fff;
  margin: 0;
}
</style>
