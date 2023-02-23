if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const indexRouter = require("./routes/index");
const driversRouter = require("./routes/drivers");
const officeRouter = require("./routes/office");
const addShiftRouter = require("./routes/addShift");
const methodOverride = require("method-override");
// const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/startLayout");

app.use(expressLayouts);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
mongoose.set("strictQuery", false);
const db = mongoose.connection;
db.on("error", error => console.error(error, "db error"));
db.once("open", () => console.log("Connected to Mongoose"));

//routes
app.use("/", indexRouter);
app.use("/drivers", driversRouter);
app.use("/office", officeRouter);
app.use("/addShiftData", addShiftRouter);

app.listen(process.env.PORT || 3000);

//*** Original Routes from Stath
// GET /drivers -> index (dashboard)
// POST /drivers -> create a new driver
// PATCH/PUT /drivers/:id -> update a driver
// GET /drivers/new -> form to create a new driver
// GET /drivers/:id -> view an individual driver

// GET /shifts/new -> create a new shift
// GET /drivers/:id/shifts/new -> create a new shift associated with a driver
// POST /shifts -> creates a new shift in mongoDB
// POST /drivers/:id/shifts -> creates a new shift in mongoDB associated w/ driver

// Once you have auth and a user logged in:
// GET /shifts -> show a driver all of their shifts in a list
// GET /shifts/new -> shows the form to create a new shift
// POST /shifts -> where the form posts to create a new shift
// http://expressjs.com/en/resources/middleware/cookie-parser.html
//*** Original Routes from Stath


//Driver Side
// GET /drivers -> index (dashboard)


//Office Side
// POST /drivers -> create a new driver
// PATCH/PUT /drivers/:id -> update a driver
// GET /drivers/new -> form to create a new driver
// GET /drivers/:id -> view an individual driver