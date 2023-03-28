const mongoose = require("mongoose");
const Shift = require("./shift")
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
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    permission: {
        type: String,
        required: true
    },
    licenseNo: {
        type: String,
        required: true
    },
    description: String
});

driverSchema.pre("remove", async function (next) {
    const driverId = this.id;
    let shifts;
    try {
        shifts = await Shift.find({ driver: driverId });
        console.log("shifts in driver model",shifts);
    } catch (error) {
        console.error("error in driver model",error);
        if (error) {
            next(error);
        }
    } 
    if (shifts.length > 0) {
        next(new Error("This driver has shifts associated still."));
    } else {
        next();
    }
})

module.exports = mongoose.model("Driver", driverSchema);