const log = require("@thnkscj/logger-plus");
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const app = express();
const port = 80

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

function makecode(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})

app.post('/shorten', urlencodedParser, (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        const dbo = db.db("url-shortener");

        const code = makecode(5);
        const url = req.body.url;

        dbo.collection("links").find({}, { projection: { _id: 0 } }).toArray(function(err, result) {
            if (err) throw err;
            if(result.find(x => x.url === url)){
                let json = result.find(x => x.url === url);

                const existingCode = json["code"];
                res.render(path.join(__dirname, '/views/code.html'), {code: existingCode});
            }else{
                const data = {url: url, code: code};
                dbo.collection("links").insertOne(data, function(err) {
                    if (err) throw err;
                    res.render(path.join(__dirname, '/views/code.html'), {code: code});
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
        dbo.collection("links").find({}, {projection: {_id: 0}}).toArray(function (err, result) {
            if (err) throw err;

            const json = result.find(x => x.code === req.params.code);

            const url = json["url"];

            res.redirect(url);
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