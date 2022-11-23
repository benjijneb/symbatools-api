const express = require('express')
const auth = require('../auth')

var router = express.Router()

router.post('/login', auth, function (req, res) {

  res.jsonp({ "username": req.session.username }) 
})

router.get('/logout', auth, function (req, res) {

  req.session.destroy()
  res.jsonp({ "loggedOut": true }) 
})

router.get('/isLoggedIn', auth, function (req, res) {

  res.jsonp({ "username": req.session.username }) 
})

module.exports = router