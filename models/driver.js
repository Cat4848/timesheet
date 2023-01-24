const mongoose = require("mongoose");
const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    licenseNo: {
        type: String,
        required: true
    },
    description: String
})

module.exports = mongoose.model("Driver", driverSchema);