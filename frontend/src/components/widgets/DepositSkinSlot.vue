<template>
  <Transition name="depo-skin-slide">
    <div
      v-if="canPlayWith"
      class="inventory-skin-slot"
      :id="skin.id"
      v-on:click="selectSkin($event, skin)"
      v-bind:class="{ selected: selectedClass }"
    >
      <img class="inventory-skin-slot-img" :src="skin.imageURL" />
      <p class="inventory-skin-slot-name">{{ skin.name }}</p>
      <p class="inventory-skin-slot-price">{{ skin.price.toFixed(2) }}</p>
    </div>
  </Transition>
</template>

<script>
export default {
  props: {
    skin: Object, // skin = {name, id, price, imageURL}
  },
  data() {
    return {
      selectedClass: this.$store.state.deposit.selectedSkins.includes(
        this.skin.id
      ),
      canPlayWith: false,
      maxPrice: this.$store.state.deposit.depositMax,
    };
  },
  computed: {
    numberOfSelectedSkins() {
      return this.$store.getters.getNumberOfSelectedSkins;
    },
    depositCurrentTotal() {
      return this.$store.getters.getSelectedTotal;
    },
  },
  mounted() {
    if (this.skin.price > this.maxPrice) {
      this.canPlayWith = false;
    } else {
      this.canPlayWith = true;
    }
  },
  methods: {
    checkNumberOfSkinsSelected(skin) {
      if (this.numberOfSelectedSkins >= 20) {
        alert("You have 20 skins selected already!");
        return false;
      } else if (skin.price + this.depositCurrentTotal > this.maxPrice) {
        alert("You can't go over the deposit max!");
        return false;
      } else {
        return true;
      }
    },
    selectSkin(event, skin) {
      if (this.$store.state.deposit.selectedSkins.includes(skin)) {
        document.getElementById(skin.id).classList.remove("selected");
        this.$store.dispatch("removeSelectedSkin", skin);
        this.$store.dispatch("substractSelectedPrice", skin.price);
      } else {
        if (this.checkNumberOfSkinsSelected(skin)) {
          document.getElementById(skin.id).classList.add("selected");
          this.$store.dispatch("addSelectedSkin", skin);
          this.$store.dispatch("addSelectedPrice", skin.price);
        }
      }
    },
  },
  name: "DepositSkinSlot",
};
</script>

<style>
.inventory-skin-slot {
  cursor: pointer;
  width: 113px;
  height: 130px;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.inventory-skin-slot-img {
  width: 80px;
  height: 80px;
  margin: 0;
}

.inventory-skin-slot-name {
  font-family: Roboto;
  color: black;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  margin: 0;
}

.inventory-skin-slot-price {
  font-family: "Montserrat";
  color: black;
  font-family: Montserrat;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  text-align: center;
  margin: 0;
}

.selected {
  background: rgba(255, 255, 255, 0.75);
}

.depo-skin-slide-enter-active,
.depo-skin-slide-leave-active {
  transition: all 0.5s ease-in-out;
}

.depo-skin-slide-enter-from,
.depo-skin-slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.fade-user-bet-enter-to {
  opacity: 1;
}
</style>
