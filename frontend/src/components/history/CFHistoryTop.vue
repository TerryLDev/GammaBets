<template>
  <div id="history-top">
    <img class="top-history-img" :src="topGame.userPic" />

    <h3 class="top-history-title">Biggest Flip</h3>

    <div style="margin-bottom: 5px" class="top-history-info">
      <p>Total Value:</p>
      <p>${{ topGame.totalValue.toFixed(2) }}</p>
    </div>

    <div class="top-history-info">
      <p>Total Items:</p>
      <p>{{ topGame.totalAmount }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: { topGame: Object },
  name: "CFHistoryTop",
};
</script>

<style></style>
