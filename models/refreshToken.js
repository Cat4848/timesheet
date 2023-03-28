const mongoose = require("mongoose");
const refreshTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    used: {
        type: Boolean,
        required: true
    }
})
module.exports = mongoose.model("RefreshToken", refreshTokenSchema);