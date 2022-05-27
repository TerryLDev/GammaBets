<template>
  <div class="player-spinner-img-div">
    <img :src="imgSrc" class="player-spinner-img" />
    <p class="num">{{ picIndex }}</p>
  </div>
</template>

<script>
export default {
  props: ["imgSrc", "picIndex"],
  name: "SpinnerPlayerImage",
};
</script>

<style>
.player-spinner-img-div {
  margin: 0;
  padding: 0;
  display: inline-block;
  text-align: center;
  position: relative;
}
.player-spinner-img {
  padding: 0;
  margin: 0px;
  width: 82px;
  height: 82px;
  padding-right: 2px;
  display: inline-block;
}
.num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
}
</style>
