if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const indexRouter = require("./routes/index");
const driversRouter = require("./routes/drivers");
const officeRouter = require("./routes/office");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressLayouts);
app.use(express.static("public"));

//routes
app.use("/", indexRouter);
app.use("/drivers", driversRouter);
app.use("/office", officeRouter);


app.listen(process.env.PORT || 3000);