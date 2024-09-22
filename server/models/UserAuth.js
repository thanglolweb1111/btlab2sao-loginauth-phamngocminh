const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
    id_User: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    TokenAcess: { type: String, required: true, unique: true },
    TokenRefress:{ type: String, required: true, unique: true },
    KeyPublic:{ type: String, required: true, unique: true },
    KeyPrivate:{ type: String, required: true, unique: true },
    HistoryToken:Array,
});

module.exports = mongoose.model('UserAuth', UserAuthSchema);