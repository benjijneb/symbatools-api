const {JsonDB, Config} = require('node-json-db')

const validator = require('validator')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

exports.createUser = async (req, res) => {

    // open db
    const db = new JsonDB(new Config("users", true, true, '/'))

    // check if everything is here (login/pwd)
    if (!req.body.username || !req.body.password) {
        
        res.status(400)
        res.json({"error": "ERR_REG_1"})
    }
    // check if login is an email
    else if (!validator.isEmail(req.body.username)) {

        res.status(400)
        res.json({"error": "ERR_REG_2"})
    }
    // send verification email
    else {

        // check if user already exist
        try {

            let data = await db.getData("/" + req.body.username)
            if (data) {

                res.status(400)
                res.json({"error": "ERR_REG_3"})
                return
            }
        } catch(error) {

            // ok
        }

        // store user
        const validationKey = crypto.randomBytes(20).toString('hex')
        const bd64ValidationInfo = Buffer.from(req.body.username + ":" + validationKey, 'utf-8').toString('base64')
        const hashedPwd = crypto.createHash('md5').update(req.body.password).digest('hex')

        db.push("/" + req.body.username, {"username": req.body.username, "password": hashedPwd, "validationKey": validationKey, "date": Date.now()})

        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.ionos.fr",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PWD,
            },
        })

        // send validation mail with validation info
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.username,
            subject: "SymbaTools registration",
            text: "https://2bfrjmfehy.eu-west-1.awsapprunner.com//users/inscription/validation/" + bd64ValidationInfo,
            html: "<p>Hello.</p><p>To finish your registration on https://symbaroum.fr, please follow this link :"
                    + "<br/>https://2bfrjmfehy.eu-west-1.awsapprunner.com/users/inscription/validation/" + bd64ValidationInfo + "</p>"
                    + "<p>Best regards,<br/>The Game Master</p>"
        }, function(err, info) {

            if (err) {
                res.status(500)
                res.json({"error": "ERR_REG_4"})
                return
            }
        })

        res.json({"created": true})
    }
}

exports.validateUser = async (req, res) => {

    // validate base64 param
    if (!req.params.validationInfo || !validator.isBase64(req.params.validationInfo)) {

        res.send("Missing validation code.")
    } else {

        // get validation info and check if everything is in it
        let validationInfo = Buffer.from(req.params.validationInfo, 'base64').toString('utf-8')
        if (validationInfo.split(":").length != 2) {

            res.send("Wrong validation code format.")
        } else {

            // everything ok so open db
            const db = new JsonDB(new Config("users", true, true, '/'))

            // now we get username and validationKey
            let username = validationInfo.split(":")[0]
            let validationKey = validationInfo.split(":")[1]

            // check if user exists in db
            let data = {}
            try {

                data = await db.getData("/" + username)
            } catch(error) {

                res.send("User does not exist.")
                return
            }

            // check if user has a validation key, if no, he is probably already validated
            // TODO need a way to send again the validation email => generate link ?
            if (data["validationKey"]) {

                if (data.validationKey === validationKey) {
                    
                    // update user (no validationKey)
                    delete data["validationKey"]
                    db.push("/" + username, data)
                    
                    // send welcome email
                    res.send("<html>Welcome ! You're now registered, please log in https://symbaroum.fr.</html>")
                } else {

                    res.send("Wrong validation code.")
                }
            } else {

                res.send("User already validated.")
            }
        }
    }
}

exports.resetPassword = async (req, res) => {

    const db = new JsonDB(new Config("users", true, true, '/'))

    let data = {}
    try {

        data = await db.getData("/" + req.body.username)
    } catch(error) {

        res.status(400)
        res.json({"error": "ERR_LOG_1"})
        return
    }

    const pwdResetToken = crypto.randomInt(100000, 999999)
    data["pwdResetToken"] = pwdResetToken
    db.push("/" + req.body.username, data)

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: "smtp.ionos.fr",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
        },
    })

    // send validation mail with validation info
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.body.username,
        subject: "SymbaTools password reset",
        text: "" + pwdResetToken,
        html: "<p>Hello.</p><p>Here is your Password Reset Token: " + pwdResetToken + "</p>"
                + "<p>Best regards,<br/>The Game Master</p>"
    }, function(err, info) {

        if (err) {
            res.status(500)
            res.json({"error": "ERR_RES_1"})
            return
        }
    })

    res.send("ok")
}

exports.validatePasswordReset = async (req, res) => {

    const db = new JsonDB(new Config("users", true, true, '/'))

    let data = {}
    try {

        data = await db.getData("/" + req.body.username)
    } catch(error) {

        res.status(400)
        res.json({"error": "ERR_LOG_1"})
        return
    }
    
    if (data["pwdResetToken"] != req.params.token) {

        res.status(400)
        res.json({"error": "ERR_RES_2"})
    } else {

        res.json({ "validated": true }) 
    }
}

exports.changePassword = async (req, res) => {

    const db = new JsonDB(new Config("users", true, true, '/'))

    let data = {}
    try {

        data = await db.getData("/" + req.body.username)
    } catch(error) {

        res.status(400)
        res.json({"error": "ERR_LOG_1"})
        return
    }

    if (data["pwdResetToken"] != req.body.token) {

        res.status(400)
        res.json({"error": "ERR_API_1"})
        return
    } else {

        const hashedPwd = crypto.createHash('md5').update(req.body.newPassword).digest('hex')
        data["password"] = hashedPwd
        db.push("/" + req.body.username, data)
    }

    res.json({ "pwdChanged": true }) 
}