<template>
	<div class="cf-history-tile">
		<img :src="historyObject.userPic" alt="Winner's Steam Picture" />

		<div class="cf-history-tile-left">
			<div class="cf-history-tile-info">
				<p>Total Value:</p>
				<p>{{ historyObject.totalValue }}</p>
			</div>

			<div class="cf-history-tile-info">
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

<style>
.cf-history-tile {
	display: grid;
	width: 100%;
	grid-template: 75px / 75px 1fr;
	grid-template-rows: 75px;
}

.cf-history-tile img {
	margin: 0;
	width: 75px;
	height: 75px;
	border-radius: 10px;
	grid-area: 1 / 1 / span 1 / span 1;
}

.cf-history-tile-left {
	display: flex;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
}

.cf-history-tile-info {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	margin: 0;
}

.cf-history-tile-info p {
	font-family: "Montserrat";
	font-style: normal;
	font-weight: 600;
	font-size: 14px;
	line-height: 17px;
	color: #fff;
}
</style>
