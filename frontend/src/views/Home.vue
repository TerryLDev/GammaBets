<template>
	<div>High Stakes</div>
	<a href="/auth/steam">Login</a>
</template>

<script>
// @ is an alias to /src
import axios from "axios";

export default {
	setup() {
		axios.get("/api/user").then((res) => {
			console.log(res.data);
		});
	},
	name: "Home",
	methods: {},
};
</script>

<style></style>
