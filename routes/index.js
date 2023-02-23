const express = require("express");
const router = express();
router.set("layout", "layouts/startLayout");

router.get("/", (req, res) => {
    res.render("index");
})

module.exports = router;