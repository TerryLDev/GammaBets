<template>
  <div id="history" class="primary-color default-cell accent-color">
    <h3 class="side-menu-title">{{ historyTitle }} History</h3>
  </div>
</template>

<script>
export default {
  props: ["historyTitle"],
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
  display: inline-block;
}
</style>
