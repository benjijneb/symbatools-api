const express = require('express')
const pcNpcController = require("../controllers/pcNpcController")
const auth = require('../auth')

var router = express.Router()

router.post('/save', auth, pcNpcController.createJson)
router.get('/list', auth, pcNpcController.getUserJsons)
router.post('/delete', auth, pcNpcController.deleteJson)
router.post('/get', auth, pcNpcController.getJson)

module.exports = router