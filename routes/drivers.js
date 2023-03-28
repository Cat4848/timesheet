const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {isAuthenticated} = require("../utils/utils");
const {isAuthorized} = require("../utils/utils");
const {isDriver} = require("../utils/utils");
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
    console.log("hidden minutes", req.body.hiddenTotalWorkingMinutes);
    let newShift;
    const workplaces = await Workplace.find({});
    const drivers = await Driver.find({});
    const shift = new Shift({
        driver: req.body.driver,
        workplace: req.body.workplace,
        start: new Date(req.body.start),
        finish: new Date(req.body.finish),
        breakDeduction: req.body.breakDeduction,
        minShift: req.body.minShift,
        totalWorkingHours: req.body.hiddenTotalWorkingHours,
        totalWorkingMinutes: req.body.hiddenTotalWorkingMinutes,
        value: req.body.hiddenValue,
        description: req.body.description
    });
    try {
        newShift = await shift.save();
        console.log(newShift);
        res.redirect("/drivers");
    } catch {
        const shiftStart = shift.start?.toISOString().slice(0, -5);
        const shiftFinish = shift.finish?.toISOString().slice(0, -5);
        res.render("drivers/addShift", {
            errorMessage: "Error Submitting Shift.",
            drivers: drivers,
            workplaces: workplaces,
            shift: shift,
            shiftStart,
            shiftFinish
        })
    }
});

//dashboard routes
router.get("/updateDashboard", async (req, res) => {
    //change to "/dashboard"
    console.log("inside express update dashboard");
    console.log("request params id", req.params.id)
    let query = Shift.find();
    query.gte("start", new Date(req.query.startDate));
    query.lte("finish", new Date(req.query.endDate));
    try {
        console.log("beginning of try statement");
        const shifts = await query.populate("workplace").exec();
        // console.log(shifts);
        res.json({shifts});
        console.log("finish try statement");
    } catch (error) {
        console.log("beginning catch statement");
        console.error(error);
    }
});

router.get("/test", (req, res) => {

    res.end();
})
module.exports = router;
