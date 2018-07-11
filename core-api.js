const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const cors = require('cors');
const data_validation = require('./middlewares/data_validation');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use(data_validation.accessTokenValidation);
app.use('/api/events/scheduler', data_validation.formDataValidation);

let routes = require('./routes/initRoutes.js');

routes.initSchedulerApiCalls(app, config);

app.listen(8080);