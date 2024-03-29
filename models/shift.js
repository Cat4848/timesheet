const mongoose = require("mongoose");
const shiftSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Driver"
    },
    workplace: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Workplace"
    },
    start: {
        type: Date,
        required: true
    },
    finish: {
        type: Date,
        required: true
    },
    breakDeduction: {
        type: Number,
        required: true
    },
    minShift: {
        type: Number,
        required: true
    },
    totalWorkingHours: {
        type: Number,
        required: true
    },
    totalWorkingMinutes: {
        type: Number,
        required: true
    },
    driverValue: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    officeValue: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    description: String
})

module.exports = mongoose.model("Shift", shiftSchema);