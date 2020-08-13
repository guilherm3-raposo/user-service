const bodyParser = require('body-parser');
const STATUS = require('http-status');
const authStore = require('../controller/auth-store');

/**
 * @MiddleWares
 */
const jsonParser = bodyParser.json();

/**
 * @param {import('express').Express} app 
 * @TODO extract route paths into module
 */
const UserService = (app, db) => {
	app.post(`/user/login`, jsonParser, (req, res) => {
		const login = req.body.login;
		const password = req.body.password;
		db.user.login({ login: login, password: password })
			.then(async resolve => {
				if (resolve && typeof resolve == 'number') {

					const hashedPassword = await authStore.authenticate(password);

					res.send({ id: resolve, token: hashedPassword });
				} else {
					res.statusCode = STATUS.NOT_FOUND;
					res.send({ error: 'USER_NOT_FOUND' });
				}
			}, reject => {
				res.send({ error: reject });
			});
	});

	app.post(`/user/create`, jsonParser, (req, res) => {
		const user = req.body;

		if (!isUserLoginValid(user.login)) {
			res.send({ error: 'LOGIN_INVALID' });
		}

		if (!isUserPasswordValid(user.password)) {
			res.send({ error: 'PASSWORD_INVALID' });
		}

		db.user.create(user)
			.then(resolve => {
				res.sendStatus(STATUS.CREATED);
			}, reject => {
				res.send({ error: 'USER_EXISTS' });
			})
			.catch(error => {
				console.error(error);
				res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
			})
	});

	app.put(`/password/update`, jsonParser, (req, res) => {
		const user = req.body;

		if (!isUpdatePasswordFormValid(user)) {
			res.sendStatus(STATUS.EXPECTATION_FAILED);
		}

		db.user.updatePassword({ username: user.username, currentPassword: user.password, newPassword: user.newPassword })
			.then(resolve => {
				res.sendStatus(STATUS.ACCEPTED);
			}, reject => {
				res.send({ error: reject })
			})
			.catch(error => {
				console.error(error);
				res.sendStatus(STATUS.INTERNAL_SERVER_ERROR);
			})
	});
}

function isUpdatePasswordFormValid(user) {
	const formHasAllFields = user.username && user.password && user.passwordControl && user.newPassword && user.newPasswordControl && true;
	const passwordsMatch = user.password === user.passwordControl && user.newPassword === user.newPasswordControl;
	return formHasAllFields && passwordsMatch;
}

function isUserLoginValid(login) {
	return typeof login == 'string' && login.length > 5 && login.length < 30;
}

function isUserPasswordValid(password) {
	return typeof password == 'string' && password.length > 6 && /[A-Z]+/g.test(password) && /[a-z]+/g.test(password) && /[0-9]+/g.test(password) && /[^\s\w]+/g.test(password);
}

module.exports = UserService;