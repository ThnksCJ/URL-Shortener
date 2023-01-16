const express = require('express');
const bodyParser = require('body-parser');
const log = require('@thnkscj/logger-plus')
const path = require('path');

const mongoose = require("mongoose");
const Links = require("./mongo/models/Links.js");
const mongoConfig = require("./mongo/config.js");

const app = express();
const port = 80;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.disable('x-powered-by'); // disable powered by express
app.use((req, res, next) => {
    res.append('x-made-by', 'ThnksCJ'); // add my credit
    next();
});

function makeCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++)
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    return result;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})

app.post('/shorten', bodyParser.urlencoded({extended: false}), async (req, res) => {
    const code = makeCode(), url = req.body.url;
    const shortURL = (req.headers['x-forwarded-proto'] === undefined ? "http" : "https") + "://" + req.headers.host + "/get/";

    const knownLink = await Links.findOne({url: url}, {code: 1}).exec();

    if (knownLink) {
        res.render(path.join(__dirname, '/views/code.html'), {code: shortURL + knownLink["code"]});
    } else {
        await Links.create({url: url, code: code}).then(() => {
            res.render(path.join(__dirname, '/views/code.html'), {code: shortURL + code});
        }).catch((err) => {
            log.WARN(err);
            res.render(path.join(__dirname, '/views/404.html'));
        });
    }
});

app.get('/get/:code', async (req, res) => {
    const link = await Links.findOne({code: req.params.code}, {url: 1}).exec();

    if (link) {
        res.redirect(link["url"]);
    } else {
        res.redirect((req.headers['x-forwarded-proto'] === undefined ? "http" : "https") + "://" + req.headers.host);
    }
})

// wildcard if the path doesn't resolve
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/404.html'));
})

app.listen(port, () => { // start webservers
    log.CLEAR()
    log.INFO(`Webserver listening on :${port}`)
    mongoose.connect(mongoConfig.url, mongoConfig.configs).then(() => console.log('Connected to MongoDB!')).catch(() => console.log('Failed to connect to MongoDB!'));
});
