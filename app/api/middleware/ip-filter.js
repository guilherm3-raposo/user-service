const STATUS = require('http-status');
let ipList = [];

const IpFilter = {
	set ipList(value) {
		if (Array.isArray(value)) {
			ipList = value;
		} else {
			throw new Error('Property ipList must be an Array');
		}
	},
	/**
	 * Blocks all requests made from IPs which are not in the IpFilter.iplist
	 *
	 * @param {Request} request
	 * @param {Response} response
	 * @param {import("express").NextFunction} next
	 * @param {Array<string>} ipList 
	 */
	module: (request, response, next) => {
		let isValidRequest = false;
		const ips = request.ips;
		const ip = request.ip;

		ips.forEach(addr => {
			if (ipList.indexOf(addr) != -1) {
				isValidRequest = true;
			}
		});

		if (ipList.indexOf(ip) != -1) {
			isValidRequest = true;
		};

		if (isValidRequest) {
			next();
		} else {
			response.sendStatus(STATUS.UNAUTHORIZED);
		};
	}
}

module.exports = IpFilter;