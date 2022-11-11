const express = require('express')
const passport = require('passport')
const usersController = require("../controllers/usersController")

var router = express.Router()

router.post('/inscription', usersController.createUser)
router.get('/inscription/validation/:validationInfo', usersController.validateUser)

module.exports = router