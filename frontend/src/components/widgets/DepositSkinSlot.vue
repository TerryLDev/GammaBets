<template>
  <div class="inventory-skin-slot" v-on:click="selectSkin($event, skin.id)">
    <img class="inventory-skin-slot-img" :src="skin.imageURL" />
    <p class="inventory-skin-slot-name">{{ skin.name }}</p>
    <p class="inventory-skin-slot-price">{{ skin.price }}</p>
  </div>
</template>

<script>
export default {
  props: {
    skin: Object, // skin = {name, id, price, imageURL}
  },
  methods: {
    selectSkin(event, id) {
      if (this.$store.state.deposit.selected.includes(id)) {
        console.log(event);
        console.log(id);
        this.$store.dispatch("removeSelectedSkin", id);
        console.log(this.$store.state.deposit.selected);
      } else {
        console.log(event);
        console.log(id);
        this.$store.dispatch("addSelectedSkin", id);
        console.log(this.$store.state.deposit.selected);
      }
    },
  },
  name: "DepositSkinSlot",
};
</script>

<style>
.inventory-skin-slot {
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

.inventory-skin-slot-label:hover {
  cursor: pointer;
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
  font-size: 14px;
  margin: 0;
}

.inventory-skin-slot-price {
  font-family: "Montserrat";
  color: black;
  font-family: Montserrat;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.skin-slot {
}
</style>
