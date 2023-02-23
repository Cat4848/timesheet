const mongoose = require("mongoose");
const workplaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: String,
    phone: Number,
    email: {
        type: String,
        unique: true
    },
    breakDeduction: {
        type: Number,
        required: true,
        max: 60
    },
    minShift: {
        type: Number,
        required: true,
        max: 10
    },
    weekDayRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    weekNightRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    saturdayDayRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    saturdayNightRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    sundayDayRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    sundayNightRate: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    description: String,
})

module.exports = mongoose.model("Workplace", workplaceSchema);