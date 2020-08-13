const queries = { user: require('../sql/queries').user };
const { comparePasswordAsync, hashPasswordAsync } = require('../utils/encryption');

/**
 * @typedef {object} UserDAO
 * @property {import('mysql').Connection} connection
 */

/**
 * @type {import('mysql').Connection}
 */
let conn;

/**
 * @TODO extract custom codes into module
 * @TODO extract business logic into controller
 * @type {UserDAO}
 */
const UserDAO = {
	set connection(connection) {
		conn = connection;
	},
	login: login,
	create: insertUser,
	updatePassword: updatePassword,
	getPassword: getPassword,
}

module.exports = UserDAO;

async function makeMeAName({ login, password, hint }) {
	const hashedPwd = await hashPasswordAsync(password);
	const loginAvailable = await isLoginAvailable(login);

	if (loginAvailable) {
		return insertUser({ login: login, password: hashedPwd, hint: hint });
	} else {
		Promise.reject('User exists');
	}
}

async function login({ login, password }) {
	return new Promise((resolve, reject) => {
		conn.query(queries.user.login, [login], (err, result) => {
			if (err) {
				reject(err);
			} else if (result && result.length) {
				comparePasswordAsync(password, result[0].password)
					.then(ok => {
						if (ok) {
							resolve(result[0].id);
						} else {
							resolve(null);
						}
					})
			} else {
				resolve(null);
			}
		});
	})
}

async function insertUser({ login, password, hint }) {
	const hashedPwd = await hashPasswordAsync(password);

	return new Promise((resolve, reject) => {
		conn.query(queries.user.insert, [login, hashedPwd, hint], (err, result) => {
			if (err) {
				reject(err);
			} else if (result) {
				resolve(result);
			} else {
				resolve(null);
			}
		});
	})
}

async function isLoginAvailable(login) {
	conn.query(queries.user.isLoginAvailable, [login], (err, result) => {
		if (err) {
			console.log(err);
			Promise.reject(err);
		} else if (result && result[0] && result[0].count == 0) {
			Promise.resolve(true);
		} else {
			Promise.resolve(false);
		}
	});
}

async function updatePassword({ username, currentPassword, newPassword }) {
	const oldPassword = await getPassword(username)
	const passwordsMatch = await comparePasswordAsync(currentPassword, oldPassword);
	const newPwdHash = await hashPasswordAsync(newPassword);

	return new Promise((resolve, reject) => {
		if (!passwordsMatch) { reject('PASSWORD_MISMATCH'); }

		conn.query(queries.user.updatePassword, [newPwdHash, username], (err, result) => {
			if (err) {
				reject(err);
			}
			if (result) {
				resolve(result);
			}
		});
	});
}

async function getPassword(login) {
	return new Promise((resolve, reject) => {
		conn.query(queries.user.getCurrentPassword, [login], (err, result) => {
			if (err) {
				reject(err);
			}
			if (result) {
				resolve(result[0].password);
			}
		});
	})
}