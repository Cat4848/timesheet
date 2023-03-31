const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {isAuthenticated} = require("../public/modules/backend/utils");
const {isAuthorized} = require("../public/modules/backend/utils");
const {isDriver} = require("../public/modules/backend/utils");
router.set("layout", "layouts/drivers");

router.use(isAuthenticated);
router.use(isAuthorized);
router.use(isDriver);

router.get("/", (req, res) => {
    //add redirect to "/drivers/dashboard"
    console.log("drivers get route" , req.session);
    res.render("drivers/dashboard", { loggedInAs: req.session.loggedInAs });
})

router.get("/addShift", async (req, res) => {
    //change to "/shifts/new"
    //display addShift view
    console.log("drivers add shift -> req.user", req.user);
    try {
        const driver = req.user;
        console.log("drivers add shift -> driver.id", driver.id);
        const workplaces = await Workplace.find({});
        res.render("drivers/addShift", {
            driver: driver,
            workplaces: workplaces,
            shift: new Shift(),
            loggedInAs: req.session.loggedInAs
        });
    } catch (error){
        console.error(error);
    }
});

router.post("/shifts", async (req, res) => {
    //add a new shift
    console.log("post new shift -> driver id", req.body.driver);
    console.log("post new shift -> driver value", req.body.driverHiddenValue);
    console.log("post new shift -> office value", req.body.officeHiddenValue);
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
        console.log("post new shift", newShift);
        res.redirect("/drivers");
    } catch (error){
        console.log("post new shift -> error", error);
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
        })
    }
});

router.get("/dashboard", async (req, res) => {
    //frontend fetch request
    console.log("drivers dashboard route");
    const driverId = req.user.id;
    let query = Shift.find();
    query.gte("start", new Date(req.query.startDate));
    query.lte("finish", new Date(req.query.endDate));
    try {
        const rawShifts = await query.populate("workplace").populate("driver");
        const shifts = rawShifts.filter(shift => shift.driver.id == driverId);
        res.json({shifts: shifts});
    } catch (error) {
        console.error("Error: Driver Dashboard Route", error);
        res.redirect("/drivers");
    }
});

router.get("/test", (req, res) => {

    res.end();
})
module.exports = router;
