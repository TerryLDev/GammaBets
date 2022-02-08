<template>
  <div id="left-column">
    <!-- Logo/Login/User -->
    <div id="login-container" class="primary-color accent-color default-cell">
      <div id="logo">
        <img src="@/assets/gammalogo.png" alt="Logo" />
        <h1 id="logo-text">GAMMABETS</h1>
      </div>

      <div id="logged-in" v-if="auth">
        <img :src="userPictureURL" />
        <h4>{{ username }}</h4>
      </div>
      <a href="/auth/steam" class="login-a" v-else>
        <div
          id="login-box"
          class="secondary-color accent-color default-secondary-cell"
        >
          <h1 id="login-text">Login</h1>
        </div>
      </a>
    </div>
    <!-- Chat -->
    <div id="chat" class="primary-color default-cell accent-color">
      <h3 class="side-menu-title">Live Chat</h3>
      <div id="chat-feed"></div>
      <div id="chat-input">
        <input
          id="chat-message-input"
          class="secondary-color default-secondary-cell accent-color"
          type="text"
          name="message"
          placeholder="Type something..."
          maxlength="250"
        />
        <button
          class="secondary-color default-secondary-cell accent-color"
          id="send-message-button"
          type="submit"
        >
          <img class="arrow" src="@/assets/Arrow1.png" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    auth: {
      type: Boolean,
      required: true,
    },
    username: {
      type: String,
    },
    userPictureURL: {
      type: String,
      required: true,
    },
  },
  name: "LeftPanel",
};
</script>

<style>
#left-column {
  display: flex;
  height: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  margin: 20px;
  flex-direction: column;
  row-gap: 20px;
  width: 350px;
}

#login-container {
  grid-area: 1 / 1 / span 4 / span 1;
  /**/
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.login-a {
  text-decoration: none;
}

#logo {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

#logo img {
  width: 70px;
  height: 70px;
  margin-right: 5px;
}

#logo-text {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  line-height: 39px;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

#login-text {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  margin: auto;
  text-align: center;
  color: #ffffff;
  text-decoration: none;
}

#login-box {
  width: 170px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
}

/* when user is logged in */
#logged-in {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
}

#logged-in img {
  width: 75px;
  height: 75px;
  border-radius: 10px;
}

#logged-in h4 {
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #ffffff;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
}

/* Main Div */
#chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: calc(100% - (20px + 200px));
  padding: 0px 10px 10px 10px;
}

/* Feed Container */
#chat-feed {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 50px;
}

/* Div For Inputs */
#chat-input {
  bottom: 0;
  display: flex;
  gap: 5px;
  margin-top: 15px;
  font-family: Montserrat;
  flex-direction: row;
  bottom: 0;
  position: absolute;
  align-items: center;
  margin-bottom: 10px;
}

#chat-message-input {
  width: 289px;
  height: 36px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  color: #ffffff;
  text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 5px;
}

#send-message-button {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
}

.arrow {
  width: 21px;
}

#chat-input input::placeholder {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #fff;
  text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.5);
}

/* Message Format */
.message {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: flex-start;
}

.message-img {
  width: 40px;
  height: 40px;
  border-radius: 5px;
}

/* Holds username and actual text */
.message-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.message-user {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #ffffff;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
}

.message-text {
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #ffffff;
  margin: 0;
}
</style>
