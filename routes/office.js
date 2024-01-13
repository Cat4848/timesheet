const express = require("express");
const router = express();
const Driver = require("../models/driver");
const Workplace = require("../models/workplace");
const Shift = require("../models/shift");
const OfficeAdmin = require("../models/officeAdmin");
const bcrypt = require("bcrypt");
const officeDashboardRouter = require("./officeDashboard");
const { isAuthenticated } = require("../public/modules/backend/utils");
const { isAuthorized } = require("../public/modules/backend/utils");
const { isOfficeAdmin } = require("../public/modules/backend/utils");
router.set("layout", "layouts/office");

router.use("/dashboard", officeDashboardRouter);
router.use(isAuthenticated);
router.use(isAuthorized);
router.use(isOfficeAdmin);

router.get("/drivers/new", (req, res) => {
  //render add newDriver page
  res.render("office/drivers/new", {
    driver: new Driver(),
    loggedInAs: req.session.loggedInAs
  });
});
router.post("/drivers", async (req, res) => {
  //post new driver
  let hashedPassword;
  let driver = new Driver({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
    permission: req.body.permission,
    licenseNo: req.body.licenseNo,
    description: req.body.description
  });
  try {
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  } catch (error) {
    res.render("office/drivers/new", {
      driver: driver,
      errorMessage: "Error encrypting password."
    });
  }
  driver.password = hashedPassword;
  try {
    const newDriver = await driver.save();
    res.redirect(`/office/drivers/${newDriver.id}`);
  } catch (error) {
    res.render("office/drivers/new", {
      driver: driver,
      errorMessage: "Error creating New Driver."
    });
  }
});

router.get("/drivers", async (req, res) => {
  //get all drivers route (view all drivers)
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const drivers = await Driver.find(searchOptions);
    res.render("office/drivers/drivers", {
      drivers: drivers,
      searchOptions: req.query,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.render("/");
  }
});

router.get("/drivers/:id", async (req, res) => {
  //view one particular driver based on id
  let driver;
  const driverId = req.params.id;
  try {
    driver = await Driver.findById(driverId);
    res.render("office/drivers/view", {
      driver: driver,
      driverId: driverId,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.render("office/drivers/view", {
      errorMessage: "Error getting driver data."
    });
  }
});

router.get("/driverData/:id", async (req, res) => {
  //front-end fetch request
  //this is used when accessing the view button of a particular driver
  let driver = [];
  let shifts = [];
  const driverId = req.params.id;
  let shiftQuery = Shift.find();

  shiftQuery.gte("start", new Date(req.query.start));
  shiftQuery.lte("finish", new Date(req.query.end));
  shiftQuery.where("driver").equals(driverId);
  try {
    driver = await Driver.findById(driverId);
    shifts = await shiftQuery.populate("workplace");
    if (shifts.length) {
      const totalHours = shifts.reduce((a, b) => a + b.totalWorkingHours, 0);
      const totalMinutes = shifts.reduce(
        (a, b) => a + b.totalWorkingMinutes,
        0
      );
      const totalTime = totalHours + totalMinutes / 60;

      const totalValue = shifts.reduce(
        (a, b) => parseFloat(a) + parseFloat(b.driverValue),
        0
      );
      res.json({
        driverName: driver.name,
        shifts: shifts,
        totalTime: totalTime,
        totalValue: totalValue
      });
    } else {
      res.json({
        errorMessage: `Please select a different date range for driver ${driver.name}.`
      });
    }
  } catch (error) {
    res.render("office/drivers/view", {
      errorMessage: "Error getting driver data."
    });
  }
});
router.get("/drivers/:id/edit", async (req, res) => {
  //serving the driver edit page
  //this is used when accessing the edit button of a particular driver
  const driverId = req.params.id;
  try {
    const driver = await Driver.findById(driverId);
    res.render("office/drivers/edit", {
      driver: driver,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/office/drivers");
  }
});

router.put("/drivers/:id", async (req, res) => {
  //edit a driver in MongoDB
  const driverId = req.params.id;
  let driver;
  try {
    driver = await Driver.findById(driverId);
    driver.name = req.body.name;
    driver.address = req.body.address;
    driver.phone = req.body.phone;
    driver.email = req.body.email;
    driver.licenseNo = req.body.licenseNo;
    driver.description = req.body.description;
    await driver.save();
    res.redirect(`/office/drivers/${driver.id}`);
  } catch {
    if (driver == null) {
      //if no driver in the database or if the database query failed
      res.redirect("/drivers");
    } else {
      //if driver exists but still have an error
      res.render("office/drivers/edit", {
        driver: driver,
        errorMessage: `Error updating driver ${driver.name}`
      });
    }
  }
});

router.delete("/drivers/:id", async (req, res) => {
  //delete a driver route
  const driverId = req.params.id;
  let driver;
  try {
    driver = await Driver.findById(driverId);
    await driver.remove();
    res.redirect("/office/drivers");
  } catch {
    if (driver == null) {
      res.redirect("/office/drivers");
    } else {
      res.redirect(`/office/drivers/${driver.id}`);
    }
  }
});

router.get("/workplaces", async (req, res) => {
  //get all workplaces
  let searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const workplaces = await Workplace.find(searchOptions);
    res.render("office/workplaces/workplaces", {
      searchOptions: req.query,
      workplaces: workplaces,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/workplaces/new", (req, res) => {
  //render add newWorkplace page
  res.render("office/workplaces/new", {
    workplace: new Workplace(),
    loggedInAs: req.session.loggedInAs
  });
});

router.post("/workplaces", async (req, res) => {
  //post new workplace
  const workplace = new Workplace({
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
    email: req.body.email,
    breakDeduction: req.body.breakDeduction,
    minShift: req.body.minShift,
    payInWeekDayRate: req.body.payInWeekDayRate,
    payInWeekNightRate: req.body.payInWeekNightRate,
    payInSaturdayDayRate: req.body.payInSaturdayDayRate,
    payInSaturdayNightRate: req.body.payInSaturdayNightRate,
    payInSundayDayRate: req.body.payInSundayDayRate,
    payInSundayNightRate: req.body.payInSundayNightRate,
    payOutWeekDayRate: req.body.payOutWeekDayRate,
    payOutWeekNightRate: req.body.payOutWeekNightRate,
    payOutSaturdayDayRate: req.body.payOutSaturdayDayRate,
    payOutSaturdayNightRate: req.body.payOutSaturdayNightRate,
    payOutSundayDayRate: req.body.payOutSundayDayRate,
    payOutSundayNightRate: req.body.payOutSundayNightRate,
    description: req.body.description
  });
  try {
    const newWorkplace = await workplace.save();
    res.redirect(`/office/workplaces/${newWorkplace.id}`);
  } catch {
    res.render("office/workplaces/new", {
      workplace: workplace,
      errorMessage: "Error Creating New Workplace."
    });
  }
});

router.get("/workplaces/:id", async (req, res) => {
  //view a particular workplace
  const workplaceId = req.params.id;
  try {
    const workplace = await Workplace.findById(workplaceId);
    res.render("office/workplaces/view", {
      workplace: workplace,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/office/workplaces");
  }
});

router.get("/workplaces/:id/edit", async (req, res) => {
  //edit a particular workplace. Serving the edit page
  const workplaceId = req.params.id;
  try {
    const workplace = await Workplace.findById(workplaceId);
    res.render("office/workplaces/edit", {
      workplace: workplace,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/office/workplaces");
  }
});

router.put("/workplaces/:id", async (req, res) => {
  //edit a workplace in MongoDB
  const workplaceId = req.params.id;
  let workplace;
  try {
    workplace = await Workplace.findById(workplaceId);
    workplace.name = req.body.name;
    workplace.address = req.body.address;
    workplace.phone = req.body.phone;
    workplace.email = req.body.email;
    workplace.breakDeduction = req.body.breakDeduction;
    workplace.minShift = req.body.minShift;
    workplace.payInWeekDayRate = req.body.payInWeekDayRate;
    workplace.payInWeekNightRate = req.body.payInWeekNightRate;
    workplace.payInSaturdayDayRate = req.body.payInSaturdayDayRate;
    workplace.payInSaturdayNightRate = req.body.payInSaturdayNightRate;
    workplace.payInSundayDayRate = req.body.payInSundayDayRate;
    workplace.payInSundayNightRate = req.body.payInSundayNightRate;
    workplace.payOutWeekDayRate = req.body.payOutWeekDayRate;
    workplace.payOutWeekNightRate = req.body.payOutWeekNightRate;
    workplace.payOutSaturdayDayRate = req.body.payOutSaturdayDayRate;
    workplace.payOutSaturdayNightRate = req.body.payOutSaturdayNightRate;
    workplace.payOutSundayDayRate = req.body.payOutSundayDayRate;
    workplace.payOutSundayNightRate = req.body.payOutSundayNightRate;
    workplace.description = req.body.description;
    await workplace.save();
    res.redirect(`/office/workplaces/${workplace.id}`);
  } catch {
    if (workplace == null) {
      //if no workplace found by id
      res.redirect("/workplaces");
    } else {
      //if workplace found by id but still an error exists
      res.render("office/workplaces/edit", {
        workplaces: workplace,
        errorMessage: "Error Editing Workplace."
      });
    }
  }
});

router.delete("/workplaces/:id", async (req, res) => {
  //delete a workplaces route
  const workplaceId = req.params.id;
  let workplace;
  try {
    workplace = await Workplace.findById(workplaceId);
    await workplace.remove();
    res.redirect("/office/workplaces");
  } catch {
    if (workplace == null) {
      res.redirect("/office/workplaces");
    } else {
      res.redirect(`/office/workplaces/${workplace.id}`);
    }
  }
});

router.get("/", (req, res) => {
  //office dashboard
  res.render("office/dashboard", { loggedInAs: req.session.loggedInAs });
});

router.get("/new", (req, res) => {
  //render new office admin form
  res.render("office/officeAdmin/new", {
    officeAdmin: new OfficeAdmin(),
    loggedInAs: req.session.loggedInAs
  });
});

router.post("/", async (req, res) => {
  //create new office admin in Mongo DB
  let officeAdmin = new OfficeAdmin({
    name: req.body.name,
    email: req.body.email,
    permission: req.body.permission
  });
  if (req.body.name != "" && req.body.email != "" && req.body.password != "") {
    let hashedPassword = "";
    try {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    } catch (error) {
      res.render("office/officeAdmin/new", {
        officeAdmin: officeAdmin,
        errorMessage: "Unable to Create New Office Admin Account. (first catch)"
      });
    }
    officeAdmin.password = hashedPassword;
    try {
      const newOfficeAdmin = await officeAdmin.save();
      // res.redirect(`/office/${newOfficeAdmin.id}`);
      res.redirect("/office/view");
    } catch (error) {
      officeAdmin.password = req.body.password;
      // req.flash("info", "Unable to add to Mongo DB");
      res.render("office/officeAdmin/new", {
        officeAdmin: officeAdmin,
        errorMessage: "Unable to Create New Office Admin Account (second catch)"
      });
    }
  } else {
    officeAdmin.password = req.body.password;
    res.render("office/officeAdmin/new", {
      officeAdmin: officeAdmin,
      errorMessage: "Unable to Create New Office Admin Account (else statement)"
    });
  }
});

//the office routes are the last ones because the "/office/:id" endpoint
//will interfere with drivers and workplaces routes
router.get("/:id/edit", async (req, res) => {
  //render edit office admin form
  const officeAdminId = req.params.id;
  try {
    const officeAdmin = await OfficeAdmin.findById(officeAdminId);
    res.render("office/officeAdmin/edit", {
      officeAdmin: officeAdmin,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  //edit office admin in Mongo DB
  const officeAdminId = req.params.id;
  const query = { _id: officeAdminId };
  let updatedOfficeAdmin = {};
  if (req.body.name != null && req.body.name != "") {
    updatedOfficeAdmin.name = req.body.name;
  }
  if (req.body.email != null && req.body.email != "") {
    updatedOfficeAdmin.email = req.body.email;
  }
  if (req.body.password != null && req.body.password != "") {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updatedOfficeAdmin.password = hashedPassword;
    } catch {
      res.render("office/officeAdmin/edit", {
        officeAdmin: updatedOfficeAdmin,
        errorMessage: "Error Updating Office Admin Account."
      });
    }
  }
  try {
    await OfficeAdmin.findOneAndUpdate(query, updatedOfficeAdmin);
    res.redirect("/office/view");
  } catch {
    res.redirect("/office/view");
  }
});

router.get("/view", async (req, res) => {
  //view all office admins
  let searchOptions = {};
  let officeAdmins = [];
  if (req.query.name != "" && req.query.name != null) {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    officeAdmins = await OfficeAdmin.find(searchOptions);
    res.render("office/officeAdmin/officeAdmins", {
      officeAdmins: officeAdmins,
      searchOptions: req.query,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.render("office/officeAdmin/officeAdmins", {
      officeAdmins: officeAdmins,
      searchOptions: req.query,
      errorMessage: "Error searching for Office Admin Account.",
      loggedInAs: req.session.loggedInAs
    });
  }
});

router.get("/test", async (req, res) => {
  res.end();
});

router.get("/request", async (req, res) => {
  res.end();
});

router.delete("/:id", async (req, res) => {
  //delete a particular office admin from Mongo DB
  //this will need to work with the authorization:
  //if you are an admin, then you can delete the office admin userInfo
  const officeAdminId = req.params.id;
  try {
    await OfficeAdmin.deleteOne({ _id: officeAdminId });
    res.redirect("/office/view");
  } catch {
    res.redirect("/office/view");
  }
});

router.get("/:id", async (req, res) => {
  //view a particular office admin
  const officeAdminId = req.params.id;
  try {
    const officeAdmin = await OfficeAdmin.findById(officeAdminId);
    res.render("office/officeAdmin/view", {
      officeAdmin: officeAdmin,
      loggedInAs: req.session.loggedInAs
    });
  } catch {
    res.redirect("/office/view");
  }
});
module.exports = router;
