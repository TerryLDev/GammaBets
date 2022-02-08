<template>
  <JackpotTimer />
  <JackpotPlayArea :potMin="potMin" :potName="potName" :potMax="potMax"/>
</template>

<script>
// @ is an alias to /src
//import axios from "axios";
import JackpotTimer from "../components/jackpot/JackpotTimer.vue";
import JackpotPlayArea from "../components/jackpot/JackpotPlayerArea.vue";

export default {
  data() {
    return {
      potMin: "1.00",
      potName: "High Stakes",
      potMax: "20.00"
    }
  },
  name: "Home",
  components: { JackpotTimer, JackpotPlayArea }
};
</script>

<style></style>
