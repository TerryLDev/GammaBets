<template>
  <div class="history-tile">
    <img :src="historyObject.userPic" alt="Winner's Steam Picture" />

    <div class="history-tile-left">
      <div class="history-tile-info">
        <p>Total Value:</p>
        <p>{{ historyObject.totalValue }}</p>
      </div>

      <div class="history-tile-info">
        <p>Total Items:</p>
        <p>{{ historyObject.totalAmount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { historyObject: Object },
};
</script>

<style></style>
