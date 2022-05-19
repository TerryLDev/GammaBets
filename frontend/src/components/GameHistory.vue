<template v-if="cfDataLoaded">
	<div id="history" class="primary-color default-cell accent-color">
		<h3 class="side-menu-title">{{ historyTitle }} History</h3>
		<div id="history-div">
			<Transition>
				<div v-if="isCF && cfDataLoaded">
					<CFHistoryTop :topGame="cfHistory.topGame" />
					<!-- Also check if it's for jackpot -->
					<div
						id="recent-history"
						v-for="histObj in cfHistory.history"
						:key="histObj.gameID"
					>
						<CFHistoryTile :historyObject="histObj" />
						<div class="tile-line-break"></div>
					</div>
				</div>
				<div v-else></div>
			</Transition>
		</div>
	</div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";

import CFHistoryTile from "./widgets/history/CFHistoryTile.vue";
import CFHistoryTop from "./widgets/history/CFHistoryTop.vue";

export default {
	props: { historyTitle: String },
	setup(props) {
		const store = useStore();

		let cfHistory = computed(() => store.state.coinflip.coinflipHistory);

		let cfDataLoaded = false;

		let isCF = false;
		let isHS = false;
		let isLS = false;

		const title = props.historyTitle.toLowerCase();

		if (title == "coinflip") {
			// get cfHistory
			isCF = true;
			axios
				.post("api/coinflip/history")
				.then((res) => {
					store.dispatch("setCoinflipHistory", res.data);
					cfDataLoaded = true;
					console.log(cfHistory.value);
				})
				.catch((err) => {
					console.log(err);
				});
		}
		// Add history for high stakes and low stakes
		else if (title == "high stake") {
			isHS = true;
		} else if (title == "low stake") {
			isLS = true;
		}

		console.log(cfHistory.value);
		console.log(isCF, isHS, isLS);

		return {
			cfDataLoaded,
			cfHistory,
			isCF,
			isHS,
			isLS,
		};
	},
	components: {
		CFHistoryTile,
		CFHistoryTop,
	},
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
	padding: 0px 10px 15px;
}

#history-div {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	margin: 0;
	padding: 0;
	width: 100%;
}

.top-history-title {
	margin: 0px 0px 15px 0px;
	font-family: "Montserrat";
	font-style: normal;
	font-weight: 700;
	font-size: 18px;
	line-height: 22px;
	color: #00ff19;
}

.top-history-info {
	font-family: "Montserrat";
	font-style: normal;
	font-weight: 700;
	font-size: 14px;
	line-height: 17px;
	color: #ffffff;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.top-history-info p {
	margin: 0;
	padding: 0;
}

.tile-line-break {
	border: 2px solid rgba(229, 239, 172, 0.5);
	box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
	width: 100%;
	margin: 0px 0px 10px;
}

.recent-history {
	width: 100%;
	height: 100%;
}
</style>
