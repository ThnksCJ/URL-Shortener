const log = require("@thnkscj/logger-plus");
const cors = require('cors');
const express = require('express');
const path = require('path');
const app = express();
const port = 80

const MongoClient = require('mongodb').MongoClient;
const url = "";

app.use(cors());
app.disable('x-powered-by'); // disable powered by express
app.use((req, res, next) => {
    res.append('x-made-by', 'ThnksCJ'); // add my credit
    next();
});

function makecode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.get('/', (req, res) => {
    res.type('text/plain');
    res.send('url shortener');
})

app.get('/shorten/:url', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db("url-shortener");
        var myobj = { url: req.params.url, code: makecode(5) };
        dbo.collection("links").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
})

app.get('/get/:code', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db("url-shortener");
        dbo.collection("links").find({}, {projection: {_id: 0}}).toArray(function (err, result) {
            if (err) throw err;

            const json = result.find(x => x.code === req.params.code);

            const url = json["url"];

            res.redirect('http://' + url + '/');
            db.close();
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