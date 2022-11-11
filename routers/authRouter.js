const express = require('express')
const passport = require('passport')
const JsonStrategy = require('passport-json').Strategy
const {JsonDB, Config} = require('node-json-db')
const crypto = require('crypto')

var router = express.Router()

passport.use(new JsonStrategy(

  async (username, password, done) => {

  const db = new JsonDB(new Config("users", true, true, '/'))
  let data = {}
  try {

    data = await db.getData("/" + username)
  } catch (error) {

    return done(null, false, { "error": "ERR_LOG_1" })
  }

  const hashedPwd = crypto.createHash('md5').update(password).digest('hex')
  if (data["password"] !== hashedPwd) {

    return done(null, false, { "error": "ERR_LOG_2" })
  }

  if (data["validationKey"]) {

    return done(null, false, { "error": "ERR_LOG_3" })
  }

  return done(null, { "username": username })
}
));

router.post('/login', function (req, res, next) {
  
  passport.authenticate('json', { session: false }, function(err, user, info) {

    if (err) { return next(err); }
    if (!user) { 

        res.status(401);
        res.json(info);
        return;
    }
    res.json(user)
  }) (req, res, next)
})

module.exports = router;