const {JsonDB, Config} = require('node-json-db')

exports.createJson = async (req, res) => {
    
    if (req.body.jsonData == null  || req.body.jsonData.nom ==null || req.body.jsonData.nom == '') {

        res.status(400)
        res.json({"error": "ERR_JSON_1"})
        return
    }

    // open db
    const db = new JsonDB(new Config(req.session.username.replaceAll('.', ''), true, true, '/'))

    db.push("/" + req.body.jsonData.nom.trim(), req.body.jsonData)

    res.send("created")
}

exports.deleteJson = async (req, res) => {

    if (req.body.name == null  || req.body.name == '') {

        res.status(400)
        res.json({"error": "ERR_JSON_1"})
        return
    }

    // open db
    const db = new JsonDB(new Config(req.session.username.replaceAll('.', ''), true, true, '/'))

    db.delete("/" + req.body.name.trim())

    res.send("deleted")
}

exports.getUserJsons = async (req, res) => {

    // open db
    const db = new JsonDB(new Config(req.session.username.replaceAll('.', ''), true, true, '/'))

    try {

        let data = await db.getData("/")
        if (data) {
            
            res.json(Object.keys(data))
        }
    } catch(error) {

        res.json({})
    }
}

exports.getJson = async (req, res) => {

    
    if (req.body.name == null  || req.body.name == '') {

        res.status(400)
        res.json({"error": "ERR_JSON_1"})
        return
    }

    // open db
    const db = new JsonDB(new Config(req.session.username.replaceAll('.', ''), true, true, '/'))

    try {

        let data = await db.getData("/" + req.body.name.trim())
        if (data) {
            
            res.json(data)
        }
    } catch(error) {

        res.json({})
    }
}