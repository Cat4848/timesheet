const mongoose = require("mongoose");
const Shift = require("./shift");
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
  payInWeekDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payInWeekNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payInSaturdayDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payInSaturdayNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payInSundayDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payInSundayNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutWeekDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutWeekNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutSaturdayDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutSaturdayNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutSundayDayRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  payOutSundayNightRate: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  description: String
});

workplaceSchema.pre("remove", async function (next) {
  const workplaceId = this.id;
  let shifts;
  try {
    shifts = await Shift.find({ workplace: workplaceId });
  } catch (error) {
    next(error);
  }
  if (shifts.length > 0) {
    next(new Error("This workplace has shifts associated still"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Workplace", workplaceSchema);
