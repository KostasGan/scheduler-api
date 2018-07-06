const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const cors = require('cors');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use((req, res, next) => {
    res.locals.access_token = req.get('X-Access-Token') ? req.get('X-Access-Token').trim() : '';
    next();
});

let routes = require('./routes/initRoutes.js');

routes.initSchedulerApiCalls(app, config);

app.listen(8080);