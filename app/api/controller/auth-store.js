const { hashPasswordAsync } = require('../utils/encryption');

const authenticated = {};

let isOriginRestrained = require('../config/app.json').RESTRAIN_LOGGED_USER_IP;

const authStore = {
	restrainOrigin: value => {
		isOriginRestrained = value;
	},

	isAuthenticated: (hash, origin) => {
		return hash && authenticated[hash] && originsMatch(hash, origin);
	},

	authenticate: async (password, origin) => {
		const hash = await hashPasswordAsync(password);
		authenticated[hash] = origin;

		return hash;
	}
}

module.exports = authStore;



function originsMatch(hash, origin) {
	return isOriginRestrained ? authenticated[hash] === origin : true;
}