const express = require('express')
const passport = require('passport')
const pcNpcController = require("../controllers/pcNpcController")

var router = express.Router()

router.post('/save', passport.authenticate('json', { session: false }), pcNpcController.createJson)
router.post('/list', passport.authenticate('json', { session: false }), pcNpcController.getUserJsons)
router.post('/delete', passport.authenticate('json', { session: false }), pcNpcController.deleteJson)
router.post('/get', passport.authenticate('json', { session: false }), pcNpcController.getJson)
module.exports = router