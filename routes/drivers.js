const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../public/modules/backend/utils");
const { isAuthorized } = require("../public/modules/backend/utils");
const { isDriver } = require("../public/modules/backend/utils");
router.set("layout", "layouts/drivers");

router.use(isAuthenticated);
router.use(isAuthorized);
router.use(isDriver);

router.get("/", (req, res) => {
  //add redirect to "/drivers/dashboard"
  res.render("drivers/dashboard", { loggedInAs: req.session.loggedInAs });
});

router.get("/addShift", async (req, res) => {
  //change to "/shifts/new"
  //display addShift view
  try {
    const driver = req.user;
    const workplaces = await Workplace.find({});
    res.render("drivers/addShift", {
      driver: driver,
      workplaces: workplaces,
      shift: new Shift(),
      loggedInAs: req.session.loggedInAs
    });
  } catch (error) {}
});

router.post("/shifts", async (req, res) => {
  //add a new shift
  let newShift;
  const workplaces = await Workplace.find({});
  const shift = new Shift({
    driver: req.body.driver,
    workplace: req.body.workplace,
    start: new Date(req.body.start),
    finish: new Date(req.body.finish),
    breakDeduction: req.body.breakDeduction,
    minShift: req.body.minShift,
    totalWorkingHours: req.body.hiddenTotalWorkingHours,
    totalWorkingMinutes: req.body.hiddenTotalWorkingMinutes,
    driverValue: req.body.driverHiddenValue,
    officeValue: req.body.officeHiddenValue,
    description: req.body.description
  });
  try {
    newShift = await shift.save();
    res.redirect("/drivers");
  } catch (error) {
    const shiftStart = shift.start?.toISOString().slice(0, -5);
    const shiftFinish = shift.finish?.toISOString().slice(0, -5);
    res.render("drivers/addShift", {
      errorMessage: "Error Submitting Shift.",
      driver: req.user.id,
      workplaces: workplaces,
      shift: shift,
      shiftStart,
      shiftFinish,
      loggedInAs: req.user.loggedInAs
    });
  }
});

router.get("/dashboard", async (req, res) => {
  //frontend fetch request
  const driverId = req.user.id;
  let query = Shift.find();
  query.gte("start", new Date(req.query.startDate));
  query.lte("finish", new Date(req.query.endDate));
  try {
    const rawShifts = await query.populate("workplace").populate("driver");
    const shifts = rawShifts.filter((shift) => shift.driver.id == driverId);
    res.json({ shifts: shifts });
  } catch (error) {
    res.redirect("/drivers");
  }
});

router.get("/test", (req, res) => {
  res.end();
});
module.exports = router;
