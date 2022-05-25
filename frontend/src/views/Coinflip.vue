<template>
	<QuickPlay />
	<CoinFlipChoice />
	<CoinFlipListings :activeGames="activeGames" />
	<GameHistory :historyTitle="historyTitle" />
	<Transition>
		<div
			id="popup-background-layer"
			v-if="showViewMenu"
			@click="closeViewMenu"
		>
			<ViewMenu />
		</div>
	</Transition>
</template>

<script>
import { computed, onMounted } from "@vue/runtime-core";
import { useStore } from "vuex";

import CoinFlipChoice from "../components/coinflip/CoinFlipChoice.vue";
import CoinFlipListings from "../components/coinflip/CoinFlipListings.vue";
import GameHistory from "../components/GameHistory.vue";
import QuickPlay from "../components/QuickPlay.vue";
import ViewMenu from "../components/coinflip/ViewMenu.vue";

import { io } from "socket.io-client";

const env = process.env.NODE_ENV;
let socket;
if (env == "development") {
	socket = io("http://localhost:4000");
} else {
	socket = io(window.location.origin);
}

export default {
	setup() {
		onMounted(() => {
			document.title = "GammaBets | CoinFlip";
		});

		const store = useStore();

		function closeViewMenu(event) {
			if (
				event.path[0] ==
				document.getElementById("popup-background-layer")
			) {
				store.dispatch("toggleViewMenu");
				store.dispatch("resetChosenView");
			}
		}

		const activeGames = computed(
			() => store.state.coinflip.activeCoinflips
		);

		const coinflipHistory = computed(
			() => store.state.coinflip.coinflipHistory
		);

		////////////////////////////////

		// CF Sockets

		socket.on("cfTimer", (data) => {
			store.dispatch("changeCFGameTimer", data);
		});

		socket.on("newCFGame", (data) => {
			store.dispatch("addNewCoinFlip", data);
		});

		socket.on("secondPlayerAccepctedTrade", (data) => {
			store.dispatch("updateCFGame", data);
		});

		socket.on("secondPlayerJoiningGame", (data) => {
			store.dispatch("updateCFGame", data);
		});

		socket.on("updateJoiningQueue", (data) => {
			store.dispatch("updateJoiningQueue", data);
		});

		socket.on("secondPlayerTradeCanceled", (data) => {
			store.dispatch("updateCFGame", data);
		});

		socket.on("cfWinner", (data) => {
			store.dispatch("updateCFGame", data);
		});

		socket.on("cfHistoryUpdate", (data) => {
			store.dispatch("setCoinflipHistory", data);
		});

		socket.on("removeCFGame", (data) => {
			store.dispatch("removeCFGame", data.GameID);
		});

		////////////////////////////////

		/*
    phase meanings
    0 = Start view menu the default config
    1 = player two is joining and the "default" timer is couting down
    2 = player two joined and the "flipping" timer is counting down
    3 = The coinflip is now in the animation phase with the coinflipping, after the animation it shows the winner
    */

		return {
			activeGames,
			coinflipHistory,
			closeViewMenu,
		};
	},
	beforeCreate() {
		this.$store.dispatch("getAPIActiveCoinflip");
		this.$store.dispatch("getAPICoinflipJoiningQueue");
	},
	data() {
		return {
			historyTitle: "CoinFlip",
			viewMenu: { game: {}, queue: {} },
		};
	},
	methods: {
		setDefaultValues() {
			this.viewMenu.game = this.$store.getters.getChosenGame;
			this.viewMenu.queue = this.$store.getters.getChosenQueue;
		},
	},
	computed: {
		showViewMenu() {
			return this.$store.state.coinflip.viewMenu.isVisible;
		},
	},
	name: "Coinflip",
	watch: {
		showViewMenu(val) {
			if (val) {
				this.setDefaultValues();
			}
		},
	},
	components: {
		GameHistory,
		QuickPlay,
		CoinFlipChoice,
		CoinFlipListings,
		ViewMenu,
	},
};
</script>
<style></style>
