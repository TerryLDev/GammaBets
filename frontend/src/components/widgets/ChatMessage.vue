<template>
  <div v-for="message in messages" v-bind:key="message" class="message">
    <img class="message-img" :src="message.profilePictureURL" />
    <div class="message-container">
      <a :href="message.profileURL"
        ><h4 class="message-user">{{ message.username }}</h4></a
      >
      <p class="message-text">{{ message.message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["messages"],
  name: "ChatMessage",
};
</script>

<style>
a {
  text-decoration: none;
}
</style>
