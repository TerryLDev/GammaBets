async function verifyIDAndUsername(steamID, username) {
	User.findOne({ SteamID: steamID }, (err, doc) => {
		if (err) return false;
		else {
			if (username == doc.Username) {
				console.log("yes");
				return true;
			} else {
				return false;
			}
		}
	});
}

module.exports = { verifyIDAndUsername };
