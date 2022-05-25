<template>
	<QuickPlay />
	<JackpotTimer :totalPotValue="totalPotVal" />
	<JackpotPlayArea
		:potMin="potMin"
		:potName="potName"
		:potMax="potMax"
		:bets="playerBets"
		:totalPotVal="totalPotVal"
	/>
	<GameHistory :historyTitle="potName" />
</template>

<script>
// @ is an alias to /src
//import axios from "axios";
import JackpotTimer from "../components/jackpot/JackpotTimer.vue";
import JackpotPlayArea from "../components/jackpot/JackpotPlayerArea.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";

export default {
	data() {
		return {
			potMin: "1.00",
			potName: "High Stakes",
			potMax: "No Limit",
			totalPotVal: 0.0,
		};
	},
	computed: {
		playerBets() {
			return this.$store.state.highStakes.game.Players;
		},
	},
	beforeCreate() {
		this.$store.dispatch("getAPIHighStakes");
		document.title = "GammaBets | High Stakes Jackpot";
	},
	name: "Home",
	components: { JackpotTimer, JackpotPlayArea, GameHistory, QuickPlay },
};
</script>

<style></style>
