const schema = require('../config/schema.json');

const user = schema.tables.user;

module.exports = {
	db: {
		create: `CREATE DATABASE IF NOT EXISTS ${schema.name};`,
		use: `USE ${schema.name};`,
		updateTables:
			`CREATE TABLE IF NOT EXISTS ${schema.name}.${user.name} (
				id INT auto_increment NOT NULL,
				${user.columns.login.name} VARCHAR(${user.columns.login.length}) NOT NULL,
				${user.columns.password.name} VARCHAR(${user.columns.password.length}) NOT NULL,
				${user.columns.hint.name} VARCHAR(${user.columns.hint.length}) NULL,
				CONSTRAINT ${user.name}_UN UNIQUE KEY (${user.columns.login.name}),
				CONSTRAINT ${user.name}_PK PRIMARY KEY (id)
			) 
			ENGINE = ${schema.engine}
			DEFAULT CHARSET = ${schema.charset} 
			COLLATE = ${schema.collation};
			`,
	},

	user: {
		login: `SELECT * FROM ${user.name} WHERE ${user.columns.login.name} = ?;`,
		getCurrentPassword: `SELECT ${user.columns.password.name} FROM ${user.name} WHERE ${user.columns.login.name} = ?`,
		updatePassword: `UPDATE ${user.name} SET ${user.columns.password.name} = ? WHERE ${user.columns.login.name} = ?;`,
		insert: `INSERT INTO ${user.name} VALUES(NULL, ?,?,?);`,
		isLoginAvailable: `SELECT COUNT(${user.columns.login.name}) AS count FROM ${user.name} WHERE ${user.columns.login.name} = ?;`,
	},

}