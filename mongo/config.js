const mongoOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const mongoConfig = {
    url: `mongodb://example.com:27017/url-shortener?authSource=admin`,
    configs: mongoOpts,
}

module.exports = mongoConfig;