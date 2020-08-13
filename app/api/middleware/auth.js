const STATUS = require('http-status');
const appConfig = require('../config/app.json');
const authStore = require('../controller/auth-store');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} req 
 * @param {import('express').NextFunction} next 
 */
const Auth = (req, res, next) => {
	jsonParser(req, res, async (err) => {
		const token = req.get("token") || req.body.token;
		const origin = req.ip;

		const loginRoute = req.url === '/user/login';

		const admin = req.body.login === appConfig.ADMIN.user && req.body.password === appConfig.ADMIN.password;

		const isAuthUser = authStore.isAuthenticated(token, origin);

		if (loginRoute && admin) {

			const rand = Math.floor(Math.random() * 1000000) + '';

			res.send({ token: await authStore.authenticate(rand, req.ip) });

		} else if (!loginRoute && !isAuthUser) {
			res.send({ error: STATUS.UNAUTHORIZED });
		} else {
			next();
		}
		return true;
	});

}


module.exports = Auth;