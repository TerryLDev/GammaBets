const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    SkinNames: {
        type: Array,
        required: true,
    },
    SkinIDs: Array,
    GameID: String,
    BotID: String
}, {
    timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;