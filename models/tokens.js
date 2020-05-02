const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuid = require("uuid");

const Tokens = new Schema({

    token: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }

});

Tokens.pre("save", async function(next) {
    // Hash the password before saving the user model
    const token = this;
    token.token = uuid.v4()
    next();

  });

module.exports = mongoose.model('tokens', Tokens);