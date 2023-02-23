const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
router.set("layout", "layouts/driversLayout");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get("/", (req, res) => {
    res.render("drivers/dashboard");
})

router.get("/addShift", async (req, res) => {
    //display addShift view
    try {
        const workplaces = await Workplace.find({});
        res.render("drivers/addShift", {
            workplaces: workplaces,
            shift: new Shift()
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
    const shift = new Shift({
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
            workplaces: workplaces,
            shift: shift,
            shiftStart,
            shiftFinish
        })
    }
});

//dashboard routes
router.get("/updateDashboard", async (req, res) => {
    console.log("request params", req.query.startDate);
    console.log("request params", req.query.endDate);
    let query = Shift.find();
    query.gte("start", new Date(req.query.startDate));
    query.lte("finish", new Date(req.query.endDate));
    // query = query.gte("start", `ISODate("${req.query.startDate}")`);
    // query = query.lte("finish", `ISODate("${req.query.finishDate}")`);
    try {
        const shifts = await query.populate("workplace");
        console.log(shifts);
        res.json({shifts});
    } catch (error) {
        console.error(error);
    }
});
module.exports = router;