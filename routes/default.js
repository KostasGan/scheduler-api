const auth = require('../helpers/oauth');
const bodyParser = require('body-parser');
const ev_controler = require('../controllers/event-scheduler');

exports.registerRoutes = function(app, config) {
    let credentials = config.get('web');
    let SCOPES = config.get('scopes');

    app.post('/', (req, res) => {
        //console.log(req.body);
        ev_controler.GetCalendarEvents(credentials, req.body.access_token);
    });

    app.post('/gauthredirect', (req, res) => {

        auth.authorizeClient(credentials, req.body.access_token).then((val) =>{
            res.json(val);
        });

        // console.log(resp);
        
        // res.setHeader('Content-Type', 'application/json');
        // res.json(resp);
    });
}