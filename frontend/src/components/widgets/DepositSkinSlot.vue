<template>
  <div
    class="inventory-skin-slot"
    :id="skin.id"
    v-on:click="selectSkin($event, skin)"
    v-bind:class="{ selected: selectedClass }"
  >
    <img class="inventory-skin-slot-img" :src="skin.imageURL" />
    <p class="inventory-skin-slot-name">{{ skin.name }}</p>
    <p class="inventory-skin-slot-price">{{ skin.price.toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  props: {
    skin: Object, // skin = {name, id, price, imageURL}
  },
  data() {
    return {
      selectedClass: this.$store.state.deposit.selectedSkinIDs.includes(
        this.skin.id
      ),
    };
  },
  methods: {
    selectSkin(event, skin) {
      if (this.$store.state.deposit.selectedSkinIDs.includes(skin.id)) {
        document.getElementById(skin.id).classList.remove("selected");
        this.$store.dispatch("removeSelectedSkin", skin);
        this.$store.dispatch("substractSelectedPrice", skin.price);
      } else {
        document.getElementById(skin.id).classList.add("selected");
        this.$store.dispatch("addSelectedSkin", skin);
        this.$store.dispatch("addSelectedPrice", skin.price);
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

.skin-slot {
}

.selected {
  background: rgba(255, 255, 255, 0.75);
}
</style>
