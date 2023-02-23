const express = require("express");
const router = express();
const Workplace = require("../models/workplace");

router.get("/:id", async (req, res) => {
    console.log("req id", req.params.id);
    try {
        const workplace = await Workplace.findById(req.params.id);
        res.json({
            breakDeduction: workplace.breakDeduction,
            minShift: workplace.minShift,
            weekDayRate: workplace.weekDayRate, 
            weekNightRate: workplace.weekNightRate, 
            saturdayDayRate: workplace.saturdayDayRate, 
            saturdayNightRate: workplace.saturdayNightRate, 
            sundayDayRate: workplace.sundayDayRate, 
            sundayNightRate: workplace.sundayNightRate, 
        });
    } catch (error) {
        console.error(`Error on database request or res.json(). Error is: ${error}`)        
    }
});

module.exports = router;