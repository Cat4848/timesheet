const express = require("express");
const router = express();

router.get("/", (req, res) => {
    res.render("index", { layout: "layouts/startLayout" });
})

module.exports = router;