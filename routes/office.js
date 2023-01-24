const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
router.set("layout", "layouts/officeLayout");


router.get("/", (req, res) => {
    res.render("office/dashboard");
})

router.get("/dashboard", (req, res) => {
    res.send("Dashboard Page");
})

//render add newDriver page
router.get("/newDriver", (req, res) => {
    res.render("office/drivers/newDriver", { driver: new Driver() });
})

//post new driver
router.post("/drivers", async (req, res) => {
    console.log("start new driver post");
    const driver = new Driver({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        licenseNo: req.body.licenseNo,
        description: req.body.description
    });
    console.log(driver.name);
    try {
        const newDriver = await driver.save();
        res.redirect("/office/drivers");
        console.log("New Driver Created Successfully");
        // res.redirect(`office/drivers/${newDriver.id}`);
    } catch {
        res.render("office/newDriver", {driver: driver});
    }
})

//get all drivers route
router.get("/drivers", async (req, res) => {
    console.log("start drivers get");
    let searchOptions = {};
    if (req.query.name != null && req.query.name != "") {
        console.log("inside if statement");
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const drivers = await Driver.find(searchOptions);
        res.render("office/drivers/drivers", {
            drivers: drivers,
            searchOptions: req.query
        });
    } catch {
        res.render("office/drivers");
    }
})

//render add newWorkplace page
router.get("/newWorkplace", (req, res) => {
    res.render("office/workplaces/newWorkplace", { workplace: new Workplace() });
})

//post new workplace
router.post("/workplaces", async (req, res) => {
    console.log("beginning of workplaces post");
    const workplace = new Workplace({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        description: req.body.description
    })
    try {
        const newWorkplace = await workplace.save();
        res.redirect("/office/workplaces");
        // res.redirect(`office/workplaces/${newWorkplace.id}`);
    } catch {
        res.render("office/workplaces/newWorkplace", { workplace: workplace });
    }
})

//get all workplaces
router.get("/workplaces", async (req, res) => {
    console.log("start workplaces get");
    let searchOptions = {};
    if (req.query.name != null && req.query.name != "") {
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const workplaces = await Workplace.find(searchOptions);
        res.render("office/workplaces/workplaces", {
            searchOptions: req.query,
            workplaces: workplaces
        });
    } catch {
        
    }
})

module.exports = router;