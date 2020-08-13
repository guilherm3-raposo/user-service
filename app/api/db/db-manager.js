const connectionManager = require('./connection-manager');
const schema = require('../config/schema.json');
const UserDAO = require('./userDAO');
const queries = { db: require('../sql/queries').db };

/**
 * @type {import('mysql').Connection}
 */
let connection;

const dbManager = {};

init();

module.exports = dbManager;

async function init() {
	let startupConn = await connectionManager.getConnection(true);

	await createSchema(startupConn);
	await useDB(startupConn);
	await updateTables(startupConn);
	await connectionManager.endConnection(startupConn);

	connection = await connectionManager.getConnection(false);
	await useDB(connection);

	UserDAO.connection = connection;
	dbManager.user = UserDAO;
}

async function createSchema(conn) {
	conn.query(queries.db.create, (err, result) => {
		if (err) {
			Promise.reject(err.message, `, code: `, err.errno);
		} else {
			Promise.resolve(result);
		}
	});
}

async function useDB(conn) {
	conn.query(queries.db.use, (err, result) => {
		if (err) {
			Promise.reject(err);
		} else {
			console.log(`Using database: ${schema.name}`);
			Promise.resolve();
		}
	});
}

async function updateTables(conn) {
	conn.query(queries.db.updateTables, (err, result) => {
		if (err) {
			Promise.reject(err);
		} else {
			Promise.resolve(result);
		}
	});
}