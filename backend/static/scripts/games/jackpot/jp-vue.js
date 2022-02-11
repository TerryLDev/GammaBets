const socket = io(window.location.origin);

export var jackpot = new Vue({
    el: "#spinner-area",
    mounted: function() {

        socket.on("test", data =>{
            this.processTest(data);
        })

    },
    methods: {
        processTest: function(data) {

            console.log(data);

        }

    }

});