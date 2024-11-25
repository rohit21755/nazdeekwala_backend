const express = require("express");
const router = express.Router();
const { isSuperAdmin, isAuthenticated } = require("../middlewares/auth");
const { addCities, getAllCities } = require("../controllers/applicationController");

router.route('/application/cities')
.post(addCities)
.get(getAllCities)