import axios from "axios";

const coinflip = {
    state: {activeCoinflips: [], coinflipHistory: []},
    getters: {},
    mutations: {
        setActiveCoinflips(state, games) {

            state.activeCoinflips = games;

        },
        setCoinflipHistory(state, history) {
            state.coinflipHistory = history;
        }
    },
    actions: {
        getAPIActiveCoinflip({commit}) {
            axios
                .get("/api/coinflip/active")
                .then(res => {
                    commit("setActiveCoinflips", res.data);
                })
                .catch(err => {
                    console.log(err)
                });
        },
        getAPICoinflipHistory({commit}) {
            axios
                .get("/api/coinflip/history")
                .then(res => {
                    commit("setCoinflipHistory", res.data);
                })
                .catch(err => {
                    console.log(err)
                });

        }
    }
}

export default coinflip;