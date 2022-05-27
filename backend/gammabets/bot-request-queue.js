const botRequestQueue = {
	queue: [],
	requestFormat: {
		request: '',
		requestID: '',
		steamID: '',
		skins: [],
		gameID: '',
		gameType: '',
		botID: '',
		attempts: 0,
		errorOccured: false,
		errorType: '',
		requestStatus: '',
	},
	requestType: {
		1: "Send Deposit",
		2: "Send Withdraw",
		3: "Confirm Withdraw",
	},
	errorType: {
		1: "Not Logged In",
    2: "Invalid Skins",
	},
	generateRequestID() {
		const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	
		let id = "";

		for(let i = 0; i < 16; i++) {
			let index = Math.floor(Math.random() * chars.length);
			id += chars[index];
		}

		return id;
	},
	sendDepositRequest(steamID, skins, gameID, gameType) {

		const newRequest = {
			request: 1,
			requestID: this.generateRequestID(),
			steamID: steamID,
			skins: skins,
			gameID: gameID,
			gameType: gameType,
			botID: botID,
			attempts: 0,
			errorOccured: false,
			errorType: '',
			requestStatus: 'incomplete',
		};

		this.queue.push(newRequest);

	},
	sendWithDrawRequest(steamID, skins, gameID, gameType) {

		const newRequest = {
			request: 2,
			requestID: this.generateRequestID(),
			steamID: steamID,
			skins: skins,
			gameID: gameID,
			gameType: gameType,
			attempts: 0,
			errorOccured: false,
			errorType: '',
			requestStatus: 'incomplete',
		};

		this.queue.push(newRequest);

	},
  errorOccured(errNum, requestID) {
    const requestIndex = this.queue.findIndex(request => request.requestID == requestID);
    this.queue[requestIndex].errorType = errNum;
    this.queue[requestIndex].errorOccured = true;
  },
	completedRequest(requestID) {
		const requestIndex = this.queue.findIndex(request => request.requestID == requestID);

		if (requestIndex > -1 && requestIndex != undefined) {
			this.queue.splice(requestIndex, 1);
		}

		else {
			console.log("\nError queue index: ", requestIndex);
			return console.log("Can not find RequestID:", requestID);
		}
	},
	checkRequestQueue() {
		if (this.queue.length > 0) {
			// fill requests
		}
		else {
			console.log("Queue is empty, all request have been filled")
		}
	}
};

module.exports = { botRequestQueue };