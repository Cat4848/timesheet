const express = require("express");
const router = express();
const Workplace = require("../models/workplace");
const {isAuthenticated} = require("../utils/utils");
const {isAuthorized} = require("../utils/utils");

router.use(isAuthenticated);
router.use(isAuthorized);

router.get("/:id", async (req, res) => {
    console.log("add shift route");
    console.log("req id", req.params.id);
    try {
        const workplace = await Workplace.findById(req.params.id);
        res.json({
            breakDeduction: workplace.breakDeduction,
            minShift: workplace.minShift,
            weekDayRate: workplace.payOutWeekDayRate, 
            weekNightRate: workplace.payOutWeekNightRate, 
            saturdayDayRate: workplace.payOutSaturdayDayRate, 
            saturdayNightRate: workplace.payOutSaturdayNightRate, 
            sundayDayRate: workplace.payOutSundayDayRate, 
            sundayNightRate: workplace.payOutSundayNightRate, 
        });
    } catch (error) {
        console.error(`Error on database request or res.json(). Error is: ${error}`)        
    }
});

module.exports = router;