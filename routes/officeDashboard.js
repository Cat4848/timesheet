const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
const {isAuthenticated} = require("../public/modules/backend/utils");
const {isAuthorized} = require("../public/modules/backend/utils");
const {isOfficeAdmin} = require("../public/modules/backend/utils");
const {toFloat} = require("../public/modules/backend/utils");
const {toHoursAndMinutes} = require("../public/modules/backend/utils");
const shift = require("../models/shift");
router.set("layout", "layouts/office");

// router.use(isAuthenticated);
// router.use(isAuthorized);
// router.use(isOfficeAdmin);

router.get("/totals", async (req, res) => {
    console.log("dashboard totals route");
    const totalDrivers = await (await Driver.find({})).length;
    const totalWorkplaces = await (await Workplace.find({})).length;
    const totals = {
        id: "totals",
        totalDrivers: totalDrivers,
        totalWorkplaces: totalWorkplaces
    }
    res.json(totals);
})

router.get("/financial", async (req, res) => {
    console.log("dashboard financial route");
    let shifts = [];
    const query = Shift.find();
    query.gte("start", new Date(req.query.start));
    query.lte("finish", new Date(req.query.end));
    try {
        shifts = await query.exec();
    } catch (error) {
        console.log("Error: Office Dashboard - Financial Section", error);
    }
    if (!shifts.length) {
        res.json({
            id: "financial",
            data: "no data",
            profit: "No Data",
            moneyIn: "No Data",
            moneyOut: "No Data",
            driversTotalHours: "No Data"
        })
    } else {
        const financialData = shifts.reduce((data, shift) => {
            let floatTotalDriversHours = 0;
            data.profit = data.profit || 0;
            data.profit += parseFloat((shift.officeValue - shift.driverValue).toFixed(2));
    
            data.moneyIn = data.moneyIn || 0;
            data.moneyIn += parseFloat(shift.officeValue);
    
            data.moneyOut = data.moneyOut || 0;
            data.moneyOut += parseFloat(shift.driverValue);
    
            data.driversTotalHours = data.driversTotalHours || 0;
            data.driversTotalHours += toFloat(shift.totalWorkingHours, shift.totalWorkingMinutes);
            return data;
        }, {id: "financial"})
        financialData.driversTotalHours = toHoursAndMinutes(financialData.driversTotalHours);
        res.json(financialData);
    }
})

router.get("/top3drivers", async (req, res) => {
    let shifts = [];
    const query = Shift.find();
    query.gte("start", new Date(req.query.start));
    query.lte("finish", new Date(req.query.end));
    try {
        shifts = await query.populate("driver");
    } catch (error) {
        console.log("Error: Top 3 Earning Drivers", error);
        res.redirect("/office");
    }
    const driverAndValue = shifts.map(shift => {
        return {
            name: shift.driver.name,
            driverValue: parseFloat(shift.driverValue)
        }
    })
    .reduce((acc, curr) => {
        if (acc.has(curr.name)) {
            acc.set(curr.name, acc.get(curr.name) + curr.driverValue)
        } else {
            acc.set(curr.name, curr.driverValue);
        }
        return acc;
    }, new Map())

    const topDrivers = Array.from(driverAndValue)
   .sort((a, b) => b[1] - a[1]);

    console.log("top 3 drivers", topDrivers);
    console.log("top 3 drivers -> array test", topDrivers.length)
    switch (topDrivers.length) {
        case 0:
            console.log("top 3 drivers case 0")
            res.json({
                id: "top3drivers",
                noData: "No Data"
            })
            break;
        case 1:
            console.log("top 3 drivers case 1")
            res.json({
                id: "top3drivers",
                driver1: topDrivers[0][0],
                driver2: "No Data",
                driver3: "No Data"
            })
            break;
        case 2:
            console.log("top 3 drivers case 3")
            res.json({
                id: "top3drivers",
                driver1: topDrivers[0][0],
                driver2: topDrivers[1][0],
                driver3: "No Data"
            })
            break;
        default:
            console.log("top 3 drivers case 4")
            res.json({
                id: "top3drivers",
                driver1: topDrivers[0][0],
                driver2: topDrivers[1][0],
                driver3: topDrivers[2][0]
            });
    }
 
})

router.get("/top3workplaces", async (req, res) => {
    let shifts = [];
    const query = Shift.find();
    query.gte("start", new Date(req.query.start));
    query.lte("finish", new Date(req.query.end));
    try {
        shifts = await query.populate("workplace");
    } catch (error) {
        console.log("Error: Top 3 Earning Drivers", error);
        res.redirect("/office");
    }
    const workplacesAndValues = shifts.map(shift => {
        return {
            name: shift.workplace.name,
            workplaceValue: parseFloat(shift.officeValue)
        }
    })
    .reduce((acc, curr) => {
        if (acc.has(curr.name)) {
            acc.set(curr.name, acc.get(curr.name) + curr.workplaceValue);
        } else {
            acc.set(curr.name, curr.workplaceValue);
        }
        return acc;
    }, new Map())

    const topWorkplaces = Array.from(workplacesAndValues)
    .sort((a, b) => b[1] - a[1]);

    console.log("top 3 workplaces -> shifts", topWorkplaces);

    switch (topWorkplaces.length) {
        case 0:
            res.json({
                id: "top3workplaces",
                noData: "No Data"
            })
            break;
        case 1:
            res.json({
                id: "top3workplaces",
                workplace1: topWorkplaces[0][0],
                workplace2: "No Data",
                workplace3: "No Data"
            })
            break;
        case 2:
            res.json({
                id: "top3workplaces",
                workplace1: topWorkplaces[0][0],
                workplace2: topWorkplaces[1][0],
                workplace3: "No Data"
            })
            break;
        default:
            console.log("top 3 workplaces case 4")
            res.json({
                id: "top3workplaces",
                workplace1: topWorkplaces[0][0],
                workplace2: topWorkplaces[1][0],
                workplace3: topWorkplaces[2][0]
            });
    }
})

router.get("/compare", (req, res) => {
    res.json("compare");
})

module.exports = router;