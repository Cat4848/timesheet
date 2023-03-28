if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const authRouter = require("./routes/auth");
const driversRouter = require("./routes/drivers");
const officeRouter = require("./routes/office");
const addShiftDataRouter = require("./routes/addShiftData");
const methodOverride = require("method-override");
const Driver = require("./models/driver");
const flash = require("express-flash");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo");
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));

if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    session.cookie.secure = true;
}
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(expressLayouts);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(cors({
    origin: true,
    credentials: true
}));

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
mongoose.set("strictQuery", false);
const db = mongoose.connection;
db.on("error", error => console.error(error, "db error"));
db.once("open", () => console.log("Connected to Mongoose"));

//routes
app.use("/", authRouter);
app.use("/drivers", driversRouter);
app.use("/office", officeRouter);
app.use("/addShiftData", addShiftDataRouter);

app.listen(process.env.PORT || 3000);