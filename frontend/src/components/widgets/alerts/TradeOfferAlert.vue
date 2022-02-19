<template>
  <div>
</template>

<script>
import {useStore} from "vuex";
import {computed} from "vue";

export default {
    setup() {
        const store = useStore();

        const isVisible = computed(() => store.getters.getTradeAlertIsVisible);
        const tradeAlertSuccess = computed(() => store.getters.getTradeAlertSuccessState);
    }

}
</script>

<style>

</style>