const express = require("express");
const router = express();
const Workplace = require("../models/workplace");
const {isAuthenticated} = require("../public/modules/backend/utils");
const {isAuthorized} = require("../public/modules/backend/utils");

router.use(isAuthenticated);
router.use(isAuthorized);

router.get("/:id", async (req, res) => {
    try {
        const workplace = await Workplace.findById(req.params.id);
        res.json({
            breakDeduction: workplace.breakDeduction,
            minShift: workplace.minShift,
            driverWeekDayRate: workplace.payOutWeekDayRate, 
            driverWeekNightRate: workplace.payOutWeekNightRate, 
            driverSaturdayDayRate: workplace.payOutSaturdayDayRate, 
            driverSaturdayNightRate: workplace.payOutSaturdayNightRate, 
            driverSundayDayRate: workplace.payOutSundayDayRate, 
            driverSundayNightRate: workplace.payOutSundayNightRate, 
            officeWeekDayRate: workplace.payInWeekDayRate, 
            officeWeekNightRate: workplace.payInWeekNightRate, 
            officeSaturdayDayRate: workplace.payInSaturdayDayRate, 
            officeSaturdayNightRate: workplace.payInSaturdayNightRate, 
            officeSundayDayRate: workplace.payInSundayDayRate, 
            officeSundayNightRate: workplace.payInSundayNightRate, 
        });
    } catch (error) {
    }
});

module.exports = router;