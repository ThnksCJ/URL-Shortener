const mongoose = require('mongoose');

const Links = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('links', Links, 'links');