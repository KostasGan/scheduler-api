const express = require('express');
const config = require('config');
const Promise = require('bluebird');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const bodyParser = require('body-parser');
const cors = require('cors');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

let routes = require('./routes/initRoutes.js');

routes.initSchedulerApiCalls(app, config);

app.listen(8080);