const mysql = require('mysql');
const dbConfig = require('../config/db.json')

/**
 * @typedef {object} AppConnections
 * @property {import('mysql').Connection} simple
 * @property {import('mysql').Connection} multiple
 */

/**
 * @type {AppConnections}
 */
const connections = {
	simple: null,
	multiple: null
}

const types = {
	MULTIPLE_STATEMENS: 'MULTIPLE_STATEMENS',
	SINGLE_STATEMENT: 'SINGLE_STATEMENT',
	0: 'MULTIPLE_STATEMENS',
	1: 'SINGLE_STATEMENT'
}

const connectionManager = {
	getConnection: getConnection,
	endConnection: endConnection,
	types: types
}

module.exports = connectionManager;

/**
 * @param {boolean} multiple
 */
async function getConnection(multiple) {
	let type = multiple ? 'multiple' : 'simple';

	let conn = connections[type];

	if (conn == null) {
		connections[type] = await createConnection(multiple);
	} else if (conn.state === 'disconnected') {
		await endConnection(conn);
		delete connections[type];
		connections[type] = await createConnection(true);
	}
	return connections[type];
}

async function endConnection(conn) {
	if (conn != null) {
		conn.end(err => {
			if (err) {
				throw new Error(err);
			} else {
				Promise.resolve(null);
			}
		})
	} else {
		Promise.resolve(null);
	}
}

function createConnection(multiple) {
	let connection = null;
	return new Promise((resolve, reject) => {
		if (!!multiple) {
			connection = mysql.createConnection({ ...dbConfig, multipleStatements: true });
		} else {
			connection = mysql.createConnection(dbConfig);
		}
		connection.connect(err => {
			if (err) {
				throw new Error(err);
			} else {
				resolve(connection);
			}
		});
	})
}