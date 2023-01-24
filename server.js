if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const indexRouter = require("./routes/index");
const driversRouter = require("./routes/drivers");
const officeRouter = require("./routes/office");
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/startLayout");

app.use(expressLayouts);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

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


app.listen(process.env.PORT || 3000);