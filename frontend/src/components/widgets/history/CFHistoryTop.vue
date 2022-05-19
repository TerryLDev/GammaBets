<template>
	<div id="cf-history-top">
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

<style>
#cf-history-top {
	margin: 0 0 15px 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.top-history-img {
	width: 100px;
	height: 100px;
	border-radius: 10px;
}
</style>
