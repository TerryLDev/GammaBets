<template>
  <button id="deposit-button">Deposit</button>
</template>

<script>
export default {
  methods: {
    checkAndSendDeposit() {
      //
    },
  },
  name: "DepositButton",
};
</script>

<style>
#deposit-button {
  width: 110px;
  height: 30px;
  background: rgba(32, 29, 30, 0.7);
  border: 1px solid rgba(229, 239, 172, 0.5);
  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  color: #ffffff;
  margin-right: 10px;
  margin-top: 0;
  margin-bottom: 0;
}

#deposit-button:hover {
  cursor: pointer;
  background-color: black;
  color: white;
}
</style>
