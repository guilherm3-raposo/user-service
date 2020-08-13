const bcrypt = require('bcrypt');

module.exports = {
	hashPasswordAsync,
	comparePasswordAsync,
}

async function hashPasswordAsync(password) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(password, 10, (err, hash) => {
			if (err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	});
}

async function comparePasswordAsync(stringPwd, hashedPwd) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(stringPwd, hashedPwd, (err, same) => {
			if (err) {
				reject(err);
			} else {
				resolve(same);
			}
		});
	});
}