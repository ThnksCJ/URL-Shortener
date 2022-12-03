const log = require("@thnkscj/logger-plus");
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const app = express();
const port = 80;

const MongoClient = require('mongodb').MongoClient;
const url = "";

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(cors());
app.disable('x-powered-by'); // disable powered by express
app.use((req, res, next) => {
    res.append('x-made-by', 'ThnksCJ'); // add my credit
    next();
});

const urlencodedParser = bodyParser.urlencoded({extended: false});

function makeCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++ ) result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})

app.post('/shorten', urlencodedParser, (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db("url-shortener");

        const code = makeCode(), url = req.body.url;
        const shortURL = (req.headers['x-forwarded-proto'] === undefined ? "http" : "https") + "://" + req.headers.host + "/get/";

        dbo.collection("links").find({}, { projection: { _id: 0 } }).toArray(function(err, result) {
            if (err) throw err;

            let json = result.find(x => x.url === url);

            if(json){
                res.render(path.join(__dirname, '/views/code.html'), {code: shortURL + json["code"]});
                db.close();
            }else{
                dbo.collection("links").insertOne({url: url, code: code}, function(err) {
                    if (err) throw err;
                    res.render(path.join(__dirname, '/views/code.html'), {code: shortURL + code});
                    db.close();
                });
            }
        });
    });
});

app.get('/get/:code', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db("url-shortener");
        dbo.collection("links").find({}, { projection: { _id: 0 } }).toArray(function(err, result) {
            if (err) throw err;

            let json = result.find(x => x.code === req.params.code);

            if(json){
                res.redirect(json["url"]);
                db.close();
            }else{
                res.redirect((req.headers['x-forwarded-proto'] === undefined ? "http" : "https") + "://" + req.headers.host);
            }
        });
    });
})

// wildcard if the path doesn't resolve
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
})

app.listen(port, () => { // start webservers
    log.CLEAR()
    log.INFO(`Webserver listening on :${port}`)
});
