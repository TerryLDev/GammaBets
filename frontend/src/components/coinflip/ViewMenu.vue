<template>
  <div class="view-menu primary-color-popup popup-cell accent-color">
		
  </div>
</template>

<script>
import {useStore} from "vuex";
import {computed} from "vue";

export default {
	setup() {
		const store = useStore();

		const game = computed(() => store.state.coinflip.viewMenu.chosenGame);

		return {
			game
		}
	},
  name: "ViewMenu",
};
</script>

<style>
.view-menu {
	position: fixed;
	width: 700px;
  height: 660px;
	top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}
</style>
