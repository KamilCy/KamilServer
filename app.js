const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')
require('./security/passportConfig');
const HOST = '0.0.0.0';
const PORT = 8080;

//create server
let app = express();

//serve repository react app
app.use('/KamilRepository', express.static('public/KamilRepository'));
app.get('/KamilRepository/index.html', (req, res)=> {
    res.sendFile(__dirname +'/public/KamilRepository/Index.html')
})

//serve static files for webApp images
app.use('/movies/posters', express.static('public/posters'));
//serve webApp aplication
app.get('/webApp/index.html', (req, res)=> {
    res.sendFile(__dirname +'/public/webApp/Index.html')
})
app.use('/webApp', express.static('public/webApp'));
//serve BarberShop aplication
app.get('/BarberShop/index.html', (req, res)=> {
    res.sendFile(__dirname +'/public/BarberShop/index.html')
})
app.use('/BarberShop', express.static('public/BarberShop'));
//serve Circuit application
app.get('/Circuit/index.html', (req, res)=> {
    res.sendFile(__dirname +'/public/Circuit/Main.html')
})
app.use('/Circuit', express.static('public/Circuit'));
//serve favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/favicon.ico');
});

// run midleware on server for webApp json
app.use((req,res,next) => {
    res.setHeader("Content-Type", "application/json")
    next();
});

app.use(cookieParser());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//cors
app.use(cors({ credentials: true, origin: true }));
app.options('*', cors()) 
//routing
app.use('/movies/', require('./routes/main'));
app.use('/movies/login', require('./routes/login'));
app.use('/movies/admin', require('./routes/admin'));




app.use((req, res, next) => {
    var err = Error('Not Found: ' + req.method + ':' + req.originalUrl);
    err.status = 404;
    next(err);
});

var server = app.listen(PORT, HOST, () => {
    console.log(`Express server listening on http://${HOST}:${PORT}`);
});

module.exports = app;