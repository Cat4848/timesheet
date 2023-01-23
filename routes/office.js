const express = require("express");
const router = express();

router.get("/", (req, res) => {
    res.send("Office Page");
})

module.exports = router;