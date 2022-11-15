const express = require('express')
const passport = require('passport')
const usersController = require("../controllers/usersController")

var router = express.Router()

router.post('/inscription', usersController.createUser)
router.get('/inscription/validation/:validationInfo', usersController.validateUser)
router.post('/pwdReset', usersController.resetPassword)
router.post('/pwdReset/validation/:token', usersController.validatePasswordReset)
router.post('/pwdReset/changePwd', usersController.changePassword)

module.exports = router