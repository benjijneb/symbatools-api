const {JsonDB, Config} = require('node-json-db')
const crypto = require('crypto')

var auth = async (req, res, next) => {
    
    if (req.session == null || req.session.username == null) {
        
        if (req.body.username == null || req.body.username == null) {

            res.status(400)
            res.json({ "error": "ERR_REG_1" })
            return
        }

        const db = new JsonDB(new Config("users", true, true, '/'))
        let data = {}
        try {
    
            data = await db.getData("/" + req.body.username)
        } catch (error) {
    
            res.status(400)
            res.json({ "error": "ERR_LOG_1" })
            return
        }
        
        const hashedPwd = crypto.createHash('md5').update(req.body.password).digest('hex')
        if (data["password"] !== hashedPwd) {
    
            res.status(400)
            res.json({ "error": "ERR_LOG_2" })
            //return next(new Error('Authentication Error'))
        } else  if (data["validationKey"]) {
    
            res.status(400)
            res.json({ "error": "ERR_LOG_3" })
            //return next(new Error('Authentication Error'))
        } else {
            req.session.username = req.body.username
            next()
        }
    } else {
        next()
    }
}

module.exports = auth