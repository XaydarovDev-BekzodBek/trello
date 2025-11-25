const { Router } = require("express");
const { getStats } = require("../controllers/stats.controller");
const router = Router();

router.get("/stats", getStats);


module.exports = router