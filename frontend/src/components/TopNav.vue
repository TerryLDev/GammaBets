<template>
  <nav id="top-nav" class="primary-color default-cell accent-color">
    <router-link to="/" id="jp-top-nav" class="default-link top-nav-text">
      <img
        class="selected-icon top-nav-icon"
        src="@/assets/icons/jpIconFixed.png"
        alt=""
      />
      High Stakes
    </router-link>
    <router-link
      to="/lowstakes"
      id="jp-top-nav"
      class="default-link top-nav-text"
    >
      <img
        class="selected-icon top-nav-icon"
        src="@/assets/icons/jpIconFixed.png"
        alt=""
      />
      Low Stakes
    </router-link>
    <router-link
      to="/coinflip"
      id="cf-top-nav"
      class="default-link top-nav-text"
      ><img
        class="top-nav-icon top-nav-text"
        src="@/assets/icons/coinflipIconFixed.png"
        alt=""
      />Coin Flip</router-link
    >
    <router-link to="/trading" class="default-link top-nav-text"
      ><img
        class="top-nav-icon top-nav-text"
        src="@/assets/icons/tradeingAKIconFixed.png"
        alt=""
      />Trading</router-link
    >
    <div class="nav-line"></div>
    <img
      class="top-nav-text"
      src="@/assets/icons/quest.png"
      alt=""
      style="margin-right: auto"
    />
    <!-- Divider -->
    <router-link to="/twitter" class="default-link">
      <img class="top-nav-text" src="@/assets/icons/twitter.png"
    /></router-link>
    <router-link to="/discord" class="default-link"
      ><img
        class="default-link top-nav-icon top-nav-text"
        src="@/assets/icons/discord.png"
    /></router-link>
    <router-link to="/tos" class="default-link top-nav-text"> TOS </router-link>
    <router-link to="/support" class="default-link top-nav-text"
      >Support</router-link
    >
  </nav>
  <router-view />
</template>

<script>
export default {};
</script>

<style>
#top-nav {
  height: 60px;
  width: 100%;
  /**/
  display: flex;
  flex-direction: row;
  align-items: center;
  /**/
  text-decoration: none;
  padding-right: 20px;
  padding-left: 20px;
  column-gap: 15px;
}

#top-nav a {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
  text-decoration: none;
}

.top-nav-icon {
  height: 18px;
}

.top-nav-text {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
}

.default-link {
  opacity: 0.7;
  color: rgb(255, 255, 255);
}

.unselected-icon {
  opacity: 0.7;
}

.selected-icon {
  opacity: 1;
}

.nav-line {
  width: 29px;
  height: 0px;
  border-top: 2px solid rgba(229, 239, 172, 0.5);
  box-sizing: border-box;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
  padding: 0px;
  margin: 0px;
}

.top-nav-text:hover {
  color: white;
  opacity: 1;
}

.router-link-active {
  opacity: 1;
}
</style>
