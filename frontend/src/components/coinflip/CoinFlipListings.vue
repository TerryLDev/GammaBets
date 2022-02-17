<template>
  <div id="cf-main" class="primary-color default-cell accent-color">
    <h3 class="side-menu-title">Coin Flips</h3>
    <div id="cf-listings">
      <UserCFListing
        v-for="game in activeGames"
        v-bind:key="game"
        :game="game"
      />
    </div>
  </div>
</template>

<script>
import UserCFListing from "./UserCFListing.vue";

export default {
  props: {
    activeGames: Array,
  },
  name: "CoinFlipListings",
  components: { UserCFListing },
};
</script>

<style>
#cf-main {
  display: inline-flex;
  margin-top: 20px;
  width: calc(100% - (20px + 350px));
  height: calc(100% - (20px + 60px + 20px + 150px + 20px));
  float: left;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px 20px 10px 20px;
}

#cf-listings {
  height: 100%;
  width: 100%;
  border-radius: 0px 0px 10px 10px;
  display: flex;
  flex-direction: column;
  align-content: center;
  gap: 5px;
}
</style>
