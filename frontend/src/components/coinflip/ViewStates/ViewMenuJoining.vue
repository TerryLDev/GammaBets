<template>
	<div
		:style="{ display: showDisplay }"
		class="view-menu primary-color-popup popup-cell"
	>
		<div class="top-view">
			<div class="player-one-view">
				<img
					class="profile-img-view"
					:class="{
						'red-border-img-view': game.game.playerOneSide == 'red',
						'black-border-img-view':
							game.game.playerOneSide == 'black',
					}"
					:src="game.game.playerOne.userPicture"
				/>
				<div class="username-container-view">
					<p>{{ game.game.playerOne.username }}</p>
				</div>
				<div class="val-items-container-view">
					<div class="val-container-view">
						<p>
							${{ playerOneTotalVal(game.game.playerOne.skins) }}
						</p>
					</div>
					<div class="item-container-view">
						<p>{{ game.game.playerOne.skins.length }}/20</p>
					</div>
				</div>
			</div>

			<div class="coin-section-view">
				<img
					class="coin-img-view"
					v-bind:src="defaultCoin(game.game.playerOneSide)"
				/>
				<p>Waiting for Player: {{ defaultTimer }}s</p>
			</div>

			<div class="player-two-view">
				<img
					class="profile-img-view"
					:class="{
						'red-border-img-view': game.game.playerTwoSide == 'red',
						'black-border-img-view':
							game.game.playerTwoSide == 'black',
					}"
					:src="queue.UserPic"
				/>
				<div class="username-container-view">
					<p>{{ queue.Username }}</p>
				</div>
				<div style="align-self: end" class="val-items-container-view">
					<div class="item-container-view">
						<p>0/20</p>
					</div>
					<div class="val-container-view">
						<p>$0.00</p>
					</div>
				</div>
			</div>
		</div>

		<div class="line-view"></div>

		<div class="bottom-view">
			<div
				class="player-skins-view"
				:class="{
					'red-skins-background-view':
						game.game.playerOneSide == 'red',
					'black-skins-background-view':
						game.game.playerOneSide == 'black',
				}"
			>
				<div
					class="skin-slot-view"
					v-for="skin in game.game.playerOne.skins"
					v-bind:key="skin"
				>
					<img :src="skin.imageURL" />
					<p>${{ skin.value.toFixed(2) }}</p>
				</div>
			</div>
			<div
				class="player-skins-view"
				:class="{
					'red-skins-background-view':
						game.game.playerTwoSide == 'red',
					'black-skins-background-view':
						game.game.playerTwoSide == 'black',
				}"
			>
				<div
					class="skin-slot-view"
					v-for="skin in game.game.playerTwo.skins"
					v-bind:key="skin"
				>
					<img :src="skin.imageURL" />
					<p>${{ skin.value.toFixed(2) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: { active: Boolean, gameID: String, queue: Object },
	data() {
		return {
			render: false,
		};
	},
	computed: {
		game() {
			return this.$store.getters.getChosenGame;
		},
		showDisplay() {
			if (this.active) {
				return "";
			} else {
				this.$nextTick();
				return "none";
			}
		},
		defaultTimer() {
			return this.$store.getters.getGameDefaultTimer(this.gameID) || 0;
		},
	},
	methods: {
		defaultCoin(side) {
			const black = require("@/assets/blackchip.png");
			const red = require("@/assets/RedChip.png");

			if (side == "red") {
				return red;
			} else {
				return black;
			}
		},
		playerOneTotalVal(skins) {
			let total = 0;
			skins.forEach((skin) => (total += skin.value));
			return total.toFixed(2);
		},
	},
	name: "ViewMenuJoining",
};
</script>

<style></style>
