<template>
  <div class="coinflip-listing">
      {{game}}
  </div>
</template>

<script>
export default {
    props: {game: Object},
    name: "UserCFListing"

}
</script>

<style>
.coinflip-listing {
width: 100%;
height: 90px;
border: 2px solid rgba(255, 255, 255, 0.25);
box-sizing: border-box;
border-radius: 10px;
}

.red-listing {

    background: rgba(236, 31, 39, 0.35);

}

.black-listing {

}

.coinflip-listing-img {
	left: 0;
	height: 77px;
	border-radius: 10px;
	margin: 0px 18px 0px 0px;
}

.cf-game-user-info {
	display: flex;
	flex-direction: column;
}

.cf-game-user-info-username {
	font-family: "Montserrat";
	font-style: normal;
	font-weight: bold;
	font-size: 18px;
	line-height: 22px;
	color: white;
	margin: 0;
}

.cf-game-user-info-value {
	font-family: "Montserrat";
	font-style: normal;
	font-weight: bold;
	font-size: 14px;
	line-height: 17px;
	color: white;
	margin: 0;
}

.cf-game-buttons {
	margin-left: auto;
}

.join-button {
	padding: 7px 12px;
	font-family: "Montserrat";
	font-style: normal;
	font-weight: bold;
	font-size: 14px;
	line-height: 17px;
	margin-right: 15px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	box-sizing: border-box;
	border-radius: 5px;
	color: white;
	cursor: pointer;
}

.view-button {
	padding: 7px 12px;
	font-family: "Montserrat";
	font-style: normal;
	font-weight: bold;
	font-size: 14px;
	line-height: 17px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	box-sizing: border-box;
	border-radius: 5px;
	color: white;
	cursor: pointer;
}
</style>