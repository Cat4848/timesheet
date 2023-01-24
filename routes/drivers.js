const express = require("express");
const router = express();
const Driver = require("../models/driver");

router.get("/", (req, res) => {
    res.send("Drivers Page");
})

module.exports = router;