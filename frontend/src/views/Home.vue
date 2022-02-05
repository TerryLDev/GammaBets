<template>
  <div>High Stakes</div>
</template>

<script>
// @ is an alias to /src
//import axios from "axios";

export default {
  data() {
    return {
      GameID: "",
      Players: [],
      Time: 0,
      TotalPotValue: 0,
    };
  },
  name: "Home",
  /*
  methods: {
    getCurrentGame() {
      axios.get("/api/jackpot/highstakes").then((res) => {
        ;
      });
    }
  },
  */
};
</script>

<style></style>
