const {JsonDB, Config} = require('node-json-db')

const validator = require('validator')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

exports.createUser = async (req, res) => {

    // open db
    const db = new JsonDB(new Config("users", true, true, '/'))

    // check if everything is here (login/pwd)
    if (!req.body.login || !req.body.password) {
        
        res.status(400)
        res.json({"error": "missing login or password", "code": 1})
    }
    // check if login is an email
    else if (!validator.isEmail(req.body.login)) {

        res.status(400)
        res.json({"error": "user name is not a valid email", "code": 2})
    }
    // send verification email
    else {

        // check if user already exist
        try {

            let data = await db.getData("/" + req.body.login)
            if (data) {

                res.status(400)
                res.json({"error": "user already exists: " + req.body.login, "code": 4})
                return
            }
        } catch(error) {

            // ok
        }

        // store user
        const validationKey = crypto.randomBytes(20).toString('hex')
        const bd64ValidationInfo = Buffer.from(req.body.login + ":" + validationKey, 'utf-8').toString('base64')
        const hashedPwd = crypto.createHash('md5').update(req.body.password).digest('hex')

        db.push("/" + req.body.login, {"login": req.body.login, "password": hashedPwd, "validationKey": validationKey, "date": Date.now()})
        
        console.log('user pushed to db')

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: "gamemaster@symbaroum.fr",
                pass: "r+&sspCv-@h#7y!",
            },
        })

        // send validation mail with validation info
        transporter.sendMail({
            from: 'gamemaster@symbaroum.fr',
            to: req.body.login,
            subject: "SymbaTools registration",
            text: "https://symbaroum.fr/users/inscription/validation/" + bd64ValidationInfo,
            html: "<p>Hello.</p><p>To finish your registration on https://symbaroum.fr, please follow this link :"
                    + "<br/>https://symbaroum.fr/users/inscription/validation/" + bd64ValidationInfo + "</p>"
                    + "<p>Best regards,<br/>The Game Master</p>"
        }, function(err, info) {

            if (err) {
                res.status(500)
                res.json({"error": "validation email couldn't be sent", "code": 3})
            } else {
                console.log('email sent')
                res.send("ok")
            }
        })
    }
}

exports.validateUser = async (req, res) => {

    // validate base64 param
    if (!req.params.validationInfo || !validator.isBase64(req.params.validationInfo)) {

        res.status(400)
        res.json({"error": "validation information provided is not b64", "code": 1})
    } else {

        // get validation info and check if everything is in it
        let validationInfo = Buffer.from(req.params.validationInfo, 'base64').toString('utf-8')
        if (validationInfo.split(":").length != 2) {

            res.status(400)
            res.json({"error": "validation information wrong format ", "code": 5})
        } else {

            // everything ok so open db
            const db = new JsonDB(new Config("users", true, true, '/'))

            // now we get login and validationKey
            let login = validationInfo.split(":")[0]
            let validationKey = validationInfo.split(":")[1]

            // check if user exists in db
            let data = {};
            try {

                data = await db.getData("/" + login)
            } catch(error) {

                res.status(400)
                res.json({"error": "user does not exist: " + login, "code": 2})
                return
            }

            // check if user has a validation key, if no, he is probably already validated
            // TODO need a way to send again the validation email => generate link ?
            if (data["validationKey"]) {

                if (data.validationKey === validationKey) {
                    
                    // update user (no validationKey)
                    delete data["validationKey"]
                    db.push("/" + login, data)
                    
                    // send welcome email
                    res.send("ok")
                } else {

                    res.status(400)
                    res.json({"error": "wrong validation key for user: " + login, "code": 3})
                }
            } else {

                res.status(400)
                res.json({"error": "user is already validated: " + login, "code": 4})
            }
        }
    }
}

// TODO reset pwd
exports.resetPassword = (req, res) => {


}