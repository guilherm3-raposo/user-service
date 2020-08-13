const path = require('path');
const express = require('express');

const appConfig = require('./config/app.json');
const authorizedOrigins = require('./config/authorized-origins.json');
const ipFilter = require('./middleware/ip-filter');
const dbManager = require('./db/db-manager');
const Auth = require('./middleware/auth');

const app = express();

ipFilter.ipList = authorizedOrigins.ipList;
app.use(ipFilter.module);
app.use(Auth);

const UserService = require('./routes/userService')(app, dbManager);

app.listen(appConfig.PORT);
console.log(`Serving API @http://localhost:${appConfig.PORT}`);