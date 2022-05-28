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

      <div v-else-if="isHS" id="history-div">
        <JPHistoryTop :topGame="hsHistory.topGame" />
        <div class="tile-line-break"></div>
        <div
          id="recent-history"
          v-for="histObj in hsHistory.history"
          :key="histObj.gameID"
        >
          <JPHistoryTile :historyObject="histObj" />
          <div class="tile-line-break"></div>
        </div>
      </div>
      <h1 v-else>KILL ME</h1>
    </Transition>
  </div>
</template>

<script>
import axios from "axios";

import CFHistoryTile from "./widgets/history/CFHistoryTile.vue";
import CFHistoryTop from "./widgets/history/CFHistoryTop.vue";
import JPHistoryTop from "./widgets/history/JPHistoryTop.vue";
import JPHistoryTile from "./widgets/history/JPHistoryTile.vue";

export default {
  props: { historyTitle: String },
  data() {
    return {
      cfHistory: {},
      hsHistory: {},
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
    getHSHistory() {
      axios
        .post("api/jackpot/highstakes/history")
        .then((res) => {
          this.$store.dispatch("setHighStakesHistory", res.data);
          this.hsHistory = res.data;
          this.isHS = true;
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
    } else if (historyType == "hs") {
      this.getHSHistory();
    }
  },
  components: {
    CFHistoryTile,
    CFHistoryTop,
    JPHistoryTop,
    JPHistoryTile,
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

.recent-history {
  width: 100%;
  height: 100%;
}
</style>
