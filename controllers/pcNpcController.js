const {JsonDB, Config} = require('node-json-db')

exports.createJson = async (req, res) => {
    
    // open db
    const db = new JsonDB(new Config(req.body.username.replaceAll('.', ''), true, true, '/'))

    db.push("/" + req.body.jsonData.nom, req.body.jsonData)

    res.send("created")
}

exports.deleteJson = async (req, res) => {
    
    // open db
    const db = new JsonDB(new Config(req.body.username.replaceAll('.', ''), true, true, '/'))

    db.delete("/" + req.body.name)

    res.send("deleted")
}

exports.getUserJsons = async (req, res) => {

    // open db
    const db = new JsonDB(new Config(req.body.username.replaceAll('.', ''), true, true, '/'))

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

    // open db
    const db = new JsonDB(new Config(req.body.username.replaceAll('.', ''), true, true, '/'))

    try {

        let data = await db.getData("/" + req.body.name)
        if (data) {
            
            res.json(data)
        }
    } catch(error) {

        res.json({})
    }
}