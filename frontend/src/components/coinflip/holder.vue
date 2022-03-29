<template>
  <div class="view-menu primary-color-popup popup-cell">
    <div class="top-view">
      <div class="player-one-view">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerOneSide == 'red',
            'black-border-img-view': game.playerOneSide == 'black',
          }"
          :src="game.playerOne.userPicture"
        />
        <div class="username-container-view">
          <p>{{ game.playerOne.username }}</p>
        </div>
        <div class="val-items-container-view">
          <div class="val-container-view">
            <p>${{ playerOneTotalVal }}</p>
          </div>
          <div class="item-container-view">
            <p>{{ game.playerOne.skins.length }}/20</p>
          </div>
        </div>
      </div>

      <div class="coin-section-view">
        <img class="coin-img-view" v-bind:src="defaultCoin(game)" />
        <!-- /\ COIN IMAGE /\ | \/ TIMER/COUNT DOWN \/ -->
        <p>{{ timerText }}</p>
      </div>

      <div class="player-two-view">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': game.playerTwoSide == 'red',
            'black-border-img-view': game.playerTwoSide == 'black',
          }"
          :src="game.playerTwo.userPicture || currentJoiningQueue.UserPic"
        />
        <div class="username-container-view">
          <p>{{ playerTwoUsername }}</p>
        </div>
        <div style="align-self: end" class="val-items-container-view">
          <div class="item-container-view">
            <p>{{ game.playerTwo.skins.length || "0" }}/20</p>
          </div>
          <div class="val-container-view">
            <p>{{ playerTwoTotalVal }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="line-view"></div>

    <div class="bottom-view">
      <div
        class="player-skins-view"
        :class="{
          'red-skins-background-view': game.playerOneSide == 'red',
          'black-skins-background-view': game.playerOneSide == 'black',
        }"
      >
        <div
          class="skin-slot-view"
          v-for="(skinPic, index) in game.playerOne.skinPictures"
          v-bind:key="skinPic"
        >
          <img :src="skinPic" />
          <p>${{ getSkinValue(game.playerOne.skinValues[index]) }}</p>
        </div>
      </div>
      <div
        class="player-skins-view"
        :class="{
          'red-skins-background-view': game.playerTwoSide == 'red',
          'black-skins-background-view': game.playerTwoSide == 'black',
        }"
      >
        <div
          class="skin-slot-view"
          v-for="(skinPic, index) in game.playerTwo.skinPictures"
          v-bind:key="skinPic"
        >
          <img :src="skinPic" />
          <p>${{ getSkinValue(game.playerTwo.skinValues[index]) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="view-menu primary-color-popup popup-cell">
    <div class="top-view">
      <div class="player-one-view">
        <img
          class="profile-img-view"
          :class="{
            'red-border-img-view': viewMenu.game.playerOneSide == 'red',
            'black-border-img-view': viewMenu.game.playerOneSide == 'black',
          }"
          :src="viewMenu.game.playerOne.userPicture"
        />
        <div class="username-container-view">
          <p>{{ viewMenu.game.playerOne.username }}</p>
        </div>
        <div class="val-items-container-view">
          <div class="val-container-view">
            <p>${{ playerOneTotalVal(viewMenu.game) }}</p>
          </div>
          <div class="item-container-view">
            <p>{{ viewMenu.game.playerOne.skins.length }}/20</p>
          </div>
        </div>
      </div>

      <div class="coin-section-view">
        <img class="coin-img-view" v-bind:src="defaultCoin(game)" />
        <!-- /\ COIN IMAGE /\ | \/ TIMER/COUNT DOWN \/ -->
        <Transition :key="viewMenu.game">
          <div
            v-if="
              viewMenu.game.playerTwoJoining &&
              viewMenu.game.playerTwoJoined &&
              viewMenu.game.winner == 'none'
            "
          >
            <p>
              {{
                "Flipping In:" +
                this.$store.getters.getGameFlippingTimer(viewMenu.game.gameID)
              }}
            </p>
          </div>
        </Transition>

        <Transition :key="viewMenu.game">
          <div
            v-if="
              viewMenu.game.playerTwoJoining &&
              viewMenu.game.playerTwoJoined == false
            "
          >
            <p>
              {{
                "Waiting: " +
                this.$store.getters.getGameDefaultTimer(viewMenu.game.gameID)
              }}
            </p>
          </div>
        </Transition>

        <Transition :key="viewMenu.game">
          <p v-if="viewMenu.game.winner != 'none'">
            {{ "Winner: " + viewMenu.game.winner }}
          </p>
        </Transition>

        <Transition :key="viewMenu.game">
          <div
            v-if="
              viewMenu.game.winner == 'none' &&
              viewMenu.game.playerTwoJoining == false &&
              viewMenu.game.playerTwoJoined == false
            "
          >
            <p>Waiting for Player...</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
